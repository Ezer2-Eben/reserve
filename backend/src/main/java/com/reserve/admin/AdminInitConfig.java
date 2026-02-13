package com.reserve.admin;



import com.reserve.admin.model.Role;
import com.reserve.admin.model.Utilisateur;
import com.reserve.admin.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminInitConfig implements CommandLineRunner {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Override
    public void run(String... args) throws Exception {
        // Vérifie si l'admin existe déjà
        if (utilisateurRepository.findByUsername("admin").isEmpty()) {
            Utilisateur admin = new Utilisateur(
                    "admin",
                    passwordEncoder.encode("admin123"),
                    Role.ADMIN
            );
            utilisateurRepository.save(admin);
            System.out.println("✅ Admin créé automatiquement avec succès !");
        } else {
            System.out.println("ℹ️ Admin déjà existant.");
        }
    }
}
