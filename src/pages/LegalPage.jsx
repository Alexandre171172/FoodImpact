import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

const SECTIONS = [
  {
    id: 'privacy',
    title: 'Politique de confidentialité',
    icon: '🔒',
    content: `FoodImpact s'engage à protéger la vie privée de ses utilisateurs.

Données collectées :
• Données de profil santé (âge, poids, taille, activité physique) — stockées localement dans le navigateur
• Historique de recherche — stocké localement dans le navigateur
• Email lors de l'inscription — nécessaire à l'authentification uniquement

Données NON collectées :
• Aucune donnée de navigation n'est transmise à des tiers
• Aucun cookie publicitaire
• Aucune donnée de localisation persistée

Droits des utilisateurs (RGPD) :
Vous disposez d'un droit d'accès, de rectification et d'effacement de vos données. Pour exercer ces droits, contactez-nous via le formulaire de contact.

Durée de conservation :
Les données locales sont supprimées à la déconnexion ou sur demande. Les données de compte sont supprimées dans les 30 jours suivant la clôture du compte.`,
  },
  {
    id: 'terms',
    title: "Conditions d'utilisation",
    icon: '📋',
    content: `En utilisant FoodImpact, vous acceptez les présentes conditions.

Objet du service :
FoodImpact est un outil d'information nutritionnelle et environnementale basé sur des données publiques. Il ne constitue pas un outil médical.

Limitations :
• Les simulations de santé sont indicatives et ne remplacent pas un avis médical professionnel
• Les données proviennent de bases de données collaboratives (Open Food Facts) et peuvent être incomplètes ou erronées
• FoodImpact ne garantit pas l'exactitude des informations affichées

Responsabilité :
FoodImpact ne saurait être tenu responsable des décisions prises sur la base des informations fournies. Consultez toujours un professionnel de santé pour des conseils médicaux ou nutritionnels.

Propriété intellectuelle :
Le code source de FoodImpact est open source. Les données alimentaires sont fournies sous licence Creative Commons (Open Food Facts).`,
  },
  {
    id: 'legal',
    title: 'Mentions légales',
    icon: '⚖️',
    content: `Éditeur :
FoodImpact — Projet open source éducatif
Hébergement : Auto-hébergé / Vercel / Netlify

Technologies utilisées :
• React 18, Tailwind CSS, Framer Motion
• React-Leaflet, Leaflet.js pour les cartes
• Open Food Facts API (CC-BY-SA)
• OpenStreetMap pour le fond de carte

Propriété intellectuelle :
Les données alimentaires sont la propriété d'Open Food Facts et de leurs contributeurs, publiées sous licence Open Database License (ODbL).
Les données d'impact environnemental proviennent d'Agribalyse (ADEME), publiées sous licence Etalab.

Contact :
Pour toute question : contact@foodimpact.app (fictif — projet démo)`,
  },
  {
    id: 'credits',
    title: 'Sources & crédits',
    icon: '📊',
    content: `Données alimentaires :
• Open Food Facts (https://world.openfoodfacts.org) — Base de données collaborative mondiale sur les produits alimentaires — Licence CC-BY-SA

Impact environnemental :
• Agribalyse (ADEME) — Base de données de référence pour l'évaluation de l'impact environnemental des produits alimentaires (méthode ACV)

Technologies open source :
• React — Interface utilisateur (Meta)
• Tailwind CSS — Utilitaires CSS
• Framer Motion — Animations
• Leaflet / React-Leaflet — Cartes interactives
• OpenStreetMap — Fond de carte (© contributeurs OpenStreetMap)
• Lucide Icons — Icônes
• ZXing — Lecture de codes-barres
• Vite — Bundler

Formules scientifiques :
• Harris-Benedict (1919, révisée 1984) — Calcul du métabolisme basal
• Mifflin-St Jeor — Dépense énergétique
• Formule d'Haversine — Calcul de distance géographique

Ce projet est à but éducatif. Aucune donnée n'est inventée — seules les données réellement disponibles dans les APIs sont affichées.`,
  },
  {
    id: 'accessibility',
    title: 'Accessibilité',
    icon: '♿',
    content: `FoodImpact s'engage à respecter les bonnes pratiques d'accessibilité :

• Contraste de couleurs conforme WCAG AA
• Navigation au clavier possible
• Attributs ARIA sur les éléments interactifs
• Textes alternatifs sur les images
• Responsive : compatible mobile, tablette, desktop

Si vous rencontrez des difficultés d'accessibilité, signalez-le via le bouton "Signaler un problème" sur n'importe quel produit.`,
  },
]

function Section({ section }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{section.icon}</span>
          <span className="text-sm font-medium text-gray-800">{section.title}</span>
        </div>
        {open ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
      </button>
      {open && (
        <div className="px-4 pb-4 border-t border-gray-50">
          <pre className="text-xs text-gray-600 leading-relaxed whitespace-pre-wrap font-sans mt-3">
            {section.content}
          </pre>
        </div>
      )}
    </div>
  )
}

export default function LegalPage() {
  return (
    <div className="p-4 pb-24">
      <h1 className="text-base font-semibold mb-2">Informations légales</h1>
      <p className="text-xs text-gray-400 mb-4">Transparence sur les données, la vie privée et les sources.</p>
      <div className="space-y-2">
        {SECTIONS.map(s => <Section key={s.id} section={s} />)}
      </div>
      <div className="mt-6 bg-fi-green-light rounded-xl p-4 text-center">
        <p className="text-xs text-fi-green-dark font-medium mb-1">FoodImpact v1.0</p>
        <p className="text-xs text-fi-green-dark/70">
          Données : Open Food Facts (CC-BY-SA) · Agribalyse (ADEME) · OpenStreetMap
        </p>
        <p className="text-xs text-fi-green-dark/50 mt-1">Aucune publicité · Aucune donnée vendue · Open source</p>
      </div>
    </div>
  )
}
