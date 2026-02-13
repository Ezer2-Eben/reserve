package com.reserve.admin.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

@Entity
@Table(name = "reserve")
@JsonIgnoreProperties({"documents","projets","alertes","historiques"})
public class Reserve {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nom;

    @NotBlank
    private String localisation;

    @NotNull
    private Double superficie;

    private String type;

    private Double latitude;
    private Double longitude;

    private String statut;

    @Column(unique = true, length = 20)
    private String code; // Code auto-généré unique (ex: RES-0001, RES-0002)

    public Reserve(Long id, String nom, String localisation, Double superficie, String type, Double latitude, Double longitude, String statut, String code, String zone, List<Document> documents, List<Projet> projets, List<Alerte> alertes, List<HistoriqueJuridique> historiques) {
        this.id = id;
        this.nom = nom;
        this.localisation = localisation;
        this.superficie = superficie;
        this.type = type;
        this.latitude = latitude;
        this.longitude = longitude;
        this.statut = statut;
        this.code = code;
        this.zone = zone;
        this.documents = documents;
        this.projets = projets;
        this.alertes = alertes;
        this.historiques = historiques;
    }

    public Reserve() {
    }

    @Lob
    @Column(columnDefinition = "TEXT") // optionnel, mais utile pour éviter les coupures de texte
    private String zone; // JSON contenant les coordonnées de la zone délimitée


    // 🔗 Relations

    @OneToMany(mappedBy = "reserve", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Document> documents;

    @OneToMany(mappedBy = "reserve", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Projet> projets;

    @OneToMany(mappedBy = "reserve", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Alerte> alertes;

    @OneToMany(mappedBy = "reserve", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<HistoriqueJuridique> historiques;

    //Constructeurs




    // 📦 Getters & Setters


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getLocalisation() {
        return localisation;
    }

    public void setLocalisation(String localisation) {
        this.localisation = localisation;
    }

    public Double getSuperficie() {
        return superficie;
    }

    public void setSuperficie(Double superficie) {
        this.superficie = superficie;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public List<Document> getDocuments() {
        return documents;
    }

    public String getZone() {
        return zone;
    }

    public void setZone(String zone) {
        this.zone = zone;
    }

    public void setDocuments(List<Document> documents) {
        this.documents = documents;
    }

    public List<Projet> getProjets() {
        return projets;
    }

    public void setProjets(List<Projet> projets) {
        this.projets = projets;
    }

    public List<Alerte> getAlertes() {
        return alertes;
    }

    public void setAlertes(List<Alerte> alertes) {
        this.alertes = alertes;
    }

    public List<HistoriqueJuridique> getHistoriques() {
        return historiques;
    }

    public void setHistoriques(List<HistoriqueJuridique> historiques) {
        this.historiques = historiques;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
