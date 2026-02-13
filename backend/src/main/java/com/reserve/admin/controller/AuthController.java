package com.reserve.admin.controller;

import com.reserve.admin.config.JwtUtils;
import com.reserve.admin.dto.LoginRequest;
import com.reserve.admin.dto.LoginResponse;
import com.reserve.admin.model.Utilisateur;
import com.reserve.admin.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000") // Adapte selon ton frontend
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            // 🔐 Authentification
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getUsername(),
                            loginRequest.getPassword()
                    )
            );

            // ✅ Authentification réussie → contexte utilisateur défini
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // 🔍 Recherche de l'utilisateur pour extraire son rôle
            Utilisateur utilisateur = utilisateurRepository.findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

            // 🎯 Génération du token
            String token = jwtUtils.generateToken(utilisateur.getUsername(), utilisateur.getRole().name());

            // 📦 Réponse au frontend
            return ResponseEntity.ok(new LoginResponse(token, utilisateur.getUsername(), utilisateur.getRole().name()));

        } catch (Exception e) {
            return ResponseEntity.status(401).body("Nom d'utilisateur ou mot de passe incorrect.");
        }
    }
}
