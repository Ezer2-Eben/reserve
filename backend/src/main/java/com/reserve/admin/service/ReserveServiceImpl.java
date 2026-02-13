package com.reserve.admin.service;

import com.reserve.admin.model.Reserve;
import com.reserve.admin.repository.ReserveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ReserveServiceImpl implements ReserveService {

    private final ReserveRepository reserveRepository;

    @Autowired
    public ReserveServiceImpl(ReserveRepository reserveRepository) {
        this.reserveRepository = reserveRepository;
    }

    @Override
    public List<Reserve> getAllReserves() {
        return reserveRepository.findAll();
    }

    @Override
    public Optional<Reserve> getReserveById(Long id) {
        return reserveRepository.findById(id);
    }

    @Override
    public Reserve createReserve(Reserve reserve) {
        // Générer automatiquement le code si non fourni
        if (reserve.getCode() == null || reserve.getCode().isEmpty()) {
            reserve.setCode(generateReserveCode());
        }
        // Sauvegarder la réserve avec le code généré
        return reserveRepository.save(reserve);
    }
    
    /**
     * Génère un code unique pour une réserve
     * Format: RES-0001, RES-0002, etc.
     */
    private String generateReserveCode() {
        // Obtenir le nombre total de réserves + 1
        long count = reserveRepository.count() + 1;
        
        // Générer le code avec format RES-XXXX (4 chiffres)
        return String.format("RES-%04d", count);
    }

    @Override
    public Reserve updateReserve(Long id, Reserve reserveDetails) {
        Optional<Reserve> optionalReserve = reserveRepository.findById(id);
        if (optionalReserve.isPresent()) {
            Reserve reserve = optionalReserve.get();
            reserve.setNom(reserveDetails.getNom());
            reserve.setType(reserveDetails.getType());
            reserve.setSuperficie(reserveDetails.getSuperficie());
            reserve.setLocalisation(reserveDetails.getLocalisation());
            reserve.setLatitude(reserveDetails.getLatitude());
            reserve.setLongitude(reserveDetails.getLongitude());
            reserve.setStatut(reserveDetails.getStatut());
            reserve.setZone(reserveDetails.getZone()); // ✅ Prise en compte de la zone
            // Le code ne doit pas être modifié lors d'une mise à jour
            // mais on peut le mettre à jour si explicitement fourni
            if (reserveDetails.getCode() != null && !reserveDetails.getCode().isEmpty()) {
                reserve.setCode(reserveDetails.getCode());
            }
            return reserveRepository.save(reserve);
        }
        return null; // ou lancer une exception personnalisée
    }

    @Override
    public void deleteReserve(Long id) {
        reserveRepository.deleteById(id);
    }
}
