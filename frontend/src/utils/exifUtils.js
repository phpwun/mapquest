/**
 * Utility functions for extracting EXIF data from images
 * Self-contained implementation that doesn't require external libraries
 */

// Extract EXIF data from an image file
export const extractExifData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = function(event) {
      try {
        const exifData = parseExif(event.target.result);
        resolve(exifData);
      } catch (error) {
        console.error('Error parsing EXIF data:', error);
        resolve(null);
      }
    };
    
    reader.onerror = function(error) {
      console.error('Error reading file:', error);
      reject(error);
    };
    
    reader.readAsArrayBuffer(file);
  });
};

// Extract GPS coordinates from EXIF data
export const extractGPSCoordinates = async (file) => {
  try {
    const exifData = await extractExifData(file);
    
    if (!exifData || !exifData.GPSInfo) {
      return null;
    }
    
    // Extract GPS data
    const { GPSLatitude, GPSLongitude, GPSLatitudeRef, GPSLongitudeRef } = exifData.GPSInfo;
    
    if (!GPSLatitude || !GPSLongitude) {
      return null;
    }
    
    // Convert to decimal degrees
    const lat = convertDMSToDD(GPSLatitude, GPSLatitudeRef);
    const lng = convertDMSToDD(GPSLongitude, GPSLongitudeRef);
    
    // Validate coordinates
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting GPS coordinates:', error);
    return null;
  }
};

// Convert DMS (degrees, minutes, seconds) to decimal degrees
const convertDMSToDD = (dmsArray, ref) => {
  if (!dmsArray || dmsArray.length !== 3) {
    return 0;
  }
  
  const [degrees, minutes, seconds] = dmsArray;
  let dd = degrees + (minutes / 60) + (seconds / 3600);
  
  // If ref is 'S' or 'W', negate the value
  if (ref === 'S' || ref === 'W') {
    dd *= -1;
  }
  
  return dd;
};

// Parse EXIF data from ArrayBuffer
const parseExif = (arrayBuffer) => {
  const dataView = new DataView(arrayBuffer);
  let offset = 0;
  const exifData = { GPSInfo: {} };
  
  // Check for JPEG SOI marker
  if (dataView.getUint16(0, false) !== 0xFFD8) {
    throw new Error('Not a valid JPEG');
  }
  
  // Find the APP1 marker (where EXIF data lives)
  offset = 2;
  while (offset < dataView.byteLength) {
    const marker = dataView.getUint16(offset, false);
    offset += 2;
    
    // APP1 marker
    if (marker === 0xFFE1) {
      const exifLength = dataView.getUint16(offset, false);
      offset += 2;
      
      // Check for "Exif\0\0" header
      const exifHeader = String.fromCharCode(
        dataView.getUint8(offset),
        dataView.getUint8(offset + 1),
        dataView.getUint8(offset + 2),
        dataView.getUint8(offset + 3),
        dataView.getUint8(offset + 4),
        dataView.getUint8(offset + 5)
      );
      
      if (exifHeader === "Exif\0\0") {
        offset += 6;
        
        // Parse TIFF header
        const tiffOffset = offset;
        const littleEndian = dataView.getUint16(offset, false) === 0x4949;
        
        // Check TIFF version
        if (dataView.getUint16(offset + 2, littleEndian) !== 0x002A) {
          throw new Error('Invalid TIFF version');
        }
        
        // Get offset to first IFD
        const firstIFDOffset = dataView.getUint32(offset + 4, littleEndian);
        
        // Parse IFD0
        const ifdOffset = tiffOffset + firstIFDOffset;
        const numEntries = dataView.getUint16(ifdOffset, littleEndian);
        let entryOffset = ifdOffset + 2;
        
        // Look for GPS IFD pointer
        for (let i = 0; i < numEntries; i++) {
          const tag = dataView.getUint16(entryOffset, littleEndian);
          
          // GPS Info pointer
          if (tag === 0x8825) {
            const gpsInfoOffset = tiffOffset + dataView.getUint32(entryOffset + 8, littleEndian);
            parseGPS(dataView, gpsInfoOffset, tiffOffset, littleEndian, exifData.GPSInfo);
            break;
          }
          
          entryOffset += 12;
        }
      }
      
      break;
    } else {
      // If not APP1, skip to next marker
      if ((marker & 0xFF00) !== 0xFF00) break;
      offset += dataView.getUint16(offset, false);
    }
  }
  
  return exifData;
};

// Parse GPS IFD
const parseGPS = (dataView, gpsOffset, tiffOffset, littleEndian, gpsInfo) => {
  const numEntries = dataView.getUint16(gpsOffset, littleEndian);
  let entryOffset = gpsOffset + 2;
  
  for (let i = 0; i < numEntries; i++) {
    const tag = dataView.getUint16(entryOffset, littleEndian);
    const type = dataView.getUint16(entryOffset + 2, littleEndian);
    const count = dataView.getUint32(entryOffset + 4, littleEndian);
    let valueOffset = entryOffset + 8;
    
    // If data doesn't fit in 4 bytes, get offset to the data
    if (type === 5 || count > 1) {
      valueOffset = tiffOffset + dataView.getUint32(valueOffset, littleEndian);
    }
    
    // Parse GPS tags
    switch (tag) {
      case 1: // GPSLatitudeRef
        gpsInfo.GPSLatitudeRef = String.fromCharCode(dataView.getUint8(valueOffset));
        break;
      case 2: // GPSLatitude
        gpsInfo.GPSLatitude = [
          dataView.getUint32(valueOffset, littleEndian) / dataView.getUint32(valueOffset + 4, littleEndian),
          dataView.getUint32(valueOffset + 8, littleEndian) / dataView.getUint32(valueOffset + 12, littleEndian),
          dataView.getUint32(valueOffset + 16, littleEndian) / dataView.getUint32(valueOffset + 20, littleEndian)
        ];
        break;
      case 3: // GPSLongitudeRef
        gpsInfo.GPSLongitudeRef = String.fromCharCode(dataView.getUint8(valueOffset));
        break;
      case 4: // GPSLongitude
        gpsInfo.GPSLongitude = [
          dataView.getUint32(valueOffset, littleEndian) / dataView.getUint32(valueOffset + 4, littleEndian),
          dataView.getUint32(valueOffset + 8, littleEndian) / dataView.getUint32(valueOffset + 12, littleEndian),
          dataView.getUint32(valueOffset + 16, littleEndian) / dataView.getUint32(valueOffset + 20, littleEndian)
        ];
        break;
    }
    
    entryOffset += 12;
  }
};