package com.reserve.admin.service;

import com.reserve.admin.model.Reserve;
import com.reserve.admin.repository.ReserveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReserveService {

    private final ReserveRepository reserveRepository;

    @Autowired
    public ReserveService(ReserveRepository reserveRepository) {
        this.reserveRepository = reserveRepository;
    }

    public List<Reserve> getAllReserves() {
        return reserveRepository.findAll();
    }

    public Optional<Reserve> getReserveById(Long id) {
        return reserveRepository.findById(id);
    }

    public Reserve createReserve(Reserve reserve) {
        // Validation supplémentaire si nécessaire
        if (reserve.getZone() == null || reserve.getZone().isEmpty()) {
            throw new IllegalArgumentException("La zone géographique est obligatoire");
        }
        
        // Calcul automatique du centre si non fourni
        if (reserve.getLatitude() == null || reserve.getLongitude() == null) {
            // Vous pourriez ajouter une logique pour extraire le centre du GeoJSON
            // Pour l'instant, on garde les valeurs fournies
        }
        
        return reserveRepository.save(reserve);
    }

    public Reserve updateReserve(Long id, Reserve reserveDetails) {
        Optional<Reserve> optionalReserve = reserveRepository.findById(id);
        
        if (optionalReserve.isPresent()) {
            Reserve reserve = optionalReserve.get();
            
            // Mise à jour des champs
            reserve.setNom(reserveDetails.getNom());
            reserve.setLocalisation(reserveDetails.getLocalisation());
            reserve.setSuperficie(reserveDetails.getSuperficie());
            reserve.setType(reserveDetails.getType());
            reserve.setLatitude(reserveDetails.getLatitude());
            reserve.setLongitude(reserveDetails.getLongitude());
            reserve.setStatut(reserveDetails.getStatut());
            reserve.setDescription(reserveDetails.getDescription());
            reserve.setProprietaire(reserveDetails.getProprietaire());
            reserve.setReference(reserveDetails.getReference());
            
            // Mise à jour de la zone si fournie
            if (reserveDetails.getZone() != null && !reserveDetails.getZone().isEmpty()) {
                reserve.setZone(reserveDetails.getZone());
            }
            
            return reserveRepository.save(reserve);
        }
        
        return null;
    }

    public void deleteReserve(Long id) {
        reserveRepository.deleteById(id);
    }
}