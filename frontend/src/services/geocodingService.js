// src/services/geocodingService.js

class GeocodingService {
  constructor() {
    this.geocoder = null;
    this.initGeocoder();
  }

  initGeocoder() {
    if (window.google && window.google.maps) {
      this.geocoder = new window.google.maps.Geocoder();
    }
  }

  // Détecter l'adresse à partir des coordonnées
  async reverseGeocode(lat, lng) {
    if (!this.geocoder) {
      this.initGeocoder();
      if (!this.geocoder) {
        throw new Error('Google Maps Geocoder non disponible');
      }
    }

    return new Promise((resolve, reject) => {
      const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };
      
      this.geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const addressComponents = results[0].address_components;
          const formattedAddress = results[0].formatted_address;
          
          const locationInfo = this.extractLocationInfo(addressComponents, formattedAddress);
          resolve(locationInfo);
        } else {
          reject(new Error(`Géocodage échoué: ${status}`));
        }
      });
    });
  }

  // Extraire les informations de localisation pertinentes
  extractLocationInfo(addressComponents, formattedAddress) {
    let locality = ''; // Ville/Quartier
    let administrativeArea = ''; // Région/Département
    let country = '';
    let neighborhood = ''; // Quartier spécifique

    for (const component of addressComponents) {
      const types = component.types;
      
      if (types.includes('neighborhood')) {
        neighborhood = component.long_name;
      } else if (types.includes('locality')) {
        locality = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        administrativeArea = component.long_name;
      } else if (types.includes('country')) {
        country = component.long_name;
      }
    }

    // Priorité pour le nom de localisation
    let primaryLocation = neighborhood || locality || administrativeArea;
    
    // Construction de la localisation complète
    let fullLocation = '';
    if (neighborhood && locality) {
      fullLocation = `${neighborhood}, ${locality}`;
    } else if (locality) {
      fullLocation = locality;
    } else if (administrativeArea) {
      fullLocation = administrativeArea;
    }

    if (country && fullLocation) {
      fullLocation += `, ${country}`;
    }

    return {
      primaryLocation, // Nom principal pour le pré-remplissage
      fullLocation,    // Localisation complète
      neighborhood,    // Quartier
      locality,        // Ville
      administrativeArea, // Région/Département
      country,         // Pays
      formattedAddress // Adresse complète formatée
    };
  }

  // Générer un nom de réserve suggéré
  generateReserveName(locationInfo, type = '') {
    const { primaryLocation, locality, administrativeArea } = locationInfo;
    
    let baseName = primaryLocation || locality || administrativeArea;
    
    if (!baseName) {
      return '';
    }

    // Nettoyer le nom (enlever les caractères spéciaux, etc.)
    baseName = baseName.replace(/[^\w\s]/g, '').trim();
    
    // Ajouter le type si fourni
    if (type) {
      return `${type} de ${baseName}`;
    }
    
    return `Réserve de ${baseName}`;
  }

  // Calculer le centre d'une zone WKT
  calculateZoneCenter(wkt) {
    try {
      // Parser le WKT pour extraire les coordonnées
      const coordinates = this.parseWKTCoordinates(wkt);
      
      if (coordinates.length === 0) {
        return null;
      }

      // Calculer le centre (moyenne des coordonnées)
      let sumLat = 0;
      let sumLng = 0;
      
      coordinates.forEach(coord => {
        sumLat += coord.lat;
        sumLng += coord.lng;
      });

      return {
        lat: sumLat / coordinates.length,
        lng: sumLng / coordinates.length
      };
    } catch (error) {
      console.error('Erreur lors du calcul du centre de la zone:', error);
      return null;
    }
  }

  // Parser les coordonnées WKT
  parseWKTCoordinates(wkt) {
    const coordinates = [];
    
    try {
      // Extraire les coordonnées du WKT POLYGON
      const match = wkt.match(/POLYGON\(\(([^)]+)\)\)/);
      if (!match) return coordinates;

      const coordString = match[1];
      const coordPairs = coordString.split(',');

      coordPairs.forEach(pair => {
        const [lng, lat] = pair.trim().split(' ').map(Number);
        if (!isNaN(lat) && !isNaN(lng)) {
          coordinates.push({ lat, lng });
        }
      });
    } catch (error) {
      console.error('Erreur lors du parsing WKT:', error);
    }

    return coordinates;
  }
}

// Instance singleton
const geocodingService = new GeocodingService();
export default geocodingService;

