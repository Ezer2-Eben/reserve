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
        // Vérifie si l'admin existe déjà (nom court admin)
        if (utilisateurRepository.findByUsernameIgnoreCase("admin").isEmpty()) {
            Utilisateur admin = new Utilisateur(
                    "admin",
                    passwordEncoder.encode("admin123"),
                    Role.ADMIN
            );
            utilisateurRepository.save(admin);
            System.out.println("✅ Admin 'admin' créé automatiquement avec succès !");
        } else {
            System.out.println("ℹ️ Admin 'admin' déjà existant.");
        }

        // Vérifie si l'admin 'admin@gmail.com' existe, si non, on le crée aussi (pratique pour les tests/frontend)
        String adminEmail = "admin@gmail.com";
        if (utilisateurRepository.findByUsernameIgnoreCase(adminEmail).isEmpty()) {
            Utilisateur adminEmailUser = new Utilisateur(
                    adminEmail,
                    passwordEncoder.encode("admin123"),
                    Role.ADMIN
            );
            utilisateurRepository.save(adminEmailUser);
            System.out.println("✅ Admin 'admin@gmail.com' créé automatiquement avec succès !");
        } else {
            System.out.println("ℹ️ Admin 'admin@gmail.com' déjà existant.");
        }
    }
}
