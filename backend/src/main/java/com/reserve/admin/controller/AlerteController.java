package com.reserve.admin.controller;

import com.reserve.admin.model.Alerte;
import com.reserve.admin.service.AlerteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alertes")
@CrossOrigin(origins = "*")
public class AlerteController {

    @Autowired
    private AlerteService alerteService;
    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public Alerte createAlerte(@RequestBody Alerte alerte) {
        return alerteService.saveAlerte(alerte);
    }
    @PreAuthorize("hasAnyAuthority('ADMIN', 'USER')")
    @GetMapping
    public List<Alerte> getAllAlertes() {
        return alerteService.getAllAlertes();
    }
    @PreAuthorize("hasAnyAuthority('ADMIN', 'USER')")
    @GetMapping("/{id}")
    public ResponseEntity<Alerte> getAlerteById(@PathVariable Long id) {
        return alerteService.getAlerteById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<Alerte> updateAlerte(@PathVariable Long id, @RequestBody Alerte alerte) {
        Alerte updated = alerteService.updateAlerte(id, alerte);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAlerte(@PathVariable Long id) {
        alerteService.deleteAlerte(id);
        return ResponseEntity.noContent().build();
    }
}
