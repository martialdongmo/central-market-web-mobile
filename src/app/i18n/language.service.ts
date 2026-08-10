import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, OnDestroy } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';

export type AppLanguage = 'en' | 'fr';

interface TranslationEntry {
  en: string;
  fr: string;
  aliases?: string[];
}

interface TranslationState {
  source: string;
  lastApplied: string;
}

const LANGUAGE_PREFERENCE_KEY = 'GROUPING_APP_LANGUAGE';
const TRANSLATABLE_ATTRIBUTES = [
  'placeholder',
  'title',
  'aria-label',
  'alt',
  'label',
  'loadingtext',
] as const;

const TRANSLATIONS: readonly TranslationEntry[] = [
  // General actions and navigation
  { en: 'Back', fr: 'Retour' },
  { en: 'Go Back', fr: 'Retour' },
  { en: 'Back to the store', fr: 'Retour à la boutique' },
  { en: 'Back to list', fr: 'Retour à la liste' },
  { en: 'Acknowledge and Go Back', fr: 'Compris, revenir' },
  { en: 'Continue Shopping', fr: 'Continuer mes achats' },
  { en: 'Browse Catalogue', fr: 'Parcourir le catalogue' },
  { en: 'Discover our products', fr: 'Découvrir nos pépites' },
  { en: 'Retry', fr: 'Réessayer' },
  { en: 'Retry payment', fr: 'Réessayer le paiement' },
  { en: 'Reset', fr: 'Réinitialiser' },
  { en: 'Reset filters', fr: 'Réinitialiser les filtres' },
  { en: 'Apply Filters', fr: 'Appliquer les filtres' },
  { en: 'Clear filter', fr: 'Effacer le filtre' },
  { en: 'Close', fr: 'Fermer' },
  { en: 'Cancel', fr: 'Annuler' },
  { en: 'Confirm', fr: 'Confirmer' },
  { en: 'Confirm & Pay', fr: 'Confirmer et payer' },
  { en: 'Loading…', fr: 'Chargement…' },
  { en: 'Processing…', fr: 'Traitement…' },
  { en: 'Processing...', fr: 'Traitement...' },
  { en: 'Status', fr: 'Statut' },
  { en: 'Date', fr: 'Date' },
  { en: 'Total', fr: 'Total' },
  { en: 'Subtotal', fr: 'Sous-total' },
  { en: 'Reference', fr: 'Référence' },
  { en: 'Account', fr: 'Compte' },
  { en: 'Email', fr: 'E-mail' },
  { en: 'Password', fr: 'Mot de passe' },
  { en: 'Phone Number', fr: 'Numéro de téléphone' },
  { en: 'Phone number', fr: 'Numéro de téléphone' },
  { en: 'City', fr: 'Ville' },
  { en: 'Description', fr: 'Description' },
  { en: 'Shop', fr: 'Boutique' },
  { en: 'Price', fr: 'Prix' },
  { en: 'Menu', fr: 'Menu' },
  { en: 'All', fr: 'Tout' },
  { en: 'Today', fr: "Aujourd'hui" },
  { en: 'This week', fr: 'Cette semaine' },
  { en: 'This month', fr: 'Ce mois-ci' },
  { en: 'Last 3 months', fr: '3 derniers mois' },
  { en: 'All time', fr: 'Toute la période' },
  { en: 'Home', fr: 'Accueil' },

  // Catalogue / home
  { en: 'Catalogue', fr: 'Catalogue' },
  { en: 'Flash Sales', fr: 'Ventes flash' },
  { en: 'Discover our', fr: 'Découvrez nos' },
  { en: 'Deals of the Day', fr: 'Offres du jour' },
  { en: 'Premium quality', fr: 'Qualité premium' },
  { en: 'Premium quality ·', fr: 'Qualité premium ·' },
  { en: 'Fast delivery', fr: 'Livraison rapide' },
  { en: 'Search products...', fr: 'Rechercher des produits...' },
  { en: 'Results', fr: 'Résultats' },
  { en: 'No results found', fr: 'Aucun résultat trouvé' },
  {
    en: 'Try different keywords or adjust your filters',
    fr: 'Essayez d’autres mots-clés ou ajustez vos filtres',
  },
  { en: 'Loading more…', fr: 'Chargement…' },
  { en: 'Filter Results', fr: 'Filtrer les résultats' },
  { en: 'Promotions', fr: 'Promotions' },
  {
    en: 'Show discounted items only',
    fr: 'Afficher uniquement les articles en promotion',
  },
  { en: 'In Stock Only', fr: 'En stock uniquement' },
  { en: 'Hide unavailable products', fr: 'Masquer les produits indisponibles' },
  { en: 'Maximum Budget', fr: 'Budget maximal' },
  { en: 'PROMO', fr: 'PROMO' },
  { en: 'Out of stock', fr: 'Épuisé' },
  { en: 'Added to cart!', fr: 'Ajouté au panier !' },
  { en: 'Nearby Stores', fr: 'Boutiques à proximité' },
  { en: 'Find stores near you!', fr: 'Trouvez des boutiques près de chez vous !' },
  {
    en: 'Check back soon for exciting promotions and special offers!',
    fr: 'Revenez bientôt pour découvrir nos promotions et offres spéciales !',
  },
  { en: 'Language', fr: 'Langue' },
  { en: 'Choose language', fr: 'Choisir la langue' },
  { en: 'French', fr: 'Français' },
  { en: 'English', fr: 'Anglais' },

  // Product details
  { en: 'Product details', fr: 'Détail produit' },
  { en: 'Product not found', fr: 'Produit introuvable' },
  {
    en: 'This product does not exist or has been removed.',
    fr: "Ce produit n'existe pas ou a été supprimé.",
  },
  { en: 'Sales', fr: 'Ventes' },
  { en: 'Popularity', fr: 'Popularité' },
  { en: 'Share this product', fr: 'Partager ce produit' },
  { en: 'Send the link to a friend', fr: 'Envoyez le lien à un ami' },
  { en: 'Add to cart', fr: 'Ajouter au panier' },
  { en: 'Product unavailable', fr: 'Produit indisponible' },
  { en: 'Add to favorites', fr: 'Ajouter aux favoris' },
  { en: 'My cart', fr: 'Mon panier' },
  { en: 'View shop', fr: 'Voir la boutique' },

  // Cart and checkout
  { en: 'My Cart', fr: 'Mon Panier' },
  {
    en: 'Review your favorites before ordering.',
    fr: 'Vérifiez vos pépites avant de commander.',
  },
  { en: 'Your cart is empty', fr: 'Votre panier est vide' },
  {
    en: 'Your cart is waiting for your favorites...',
    fr: 'Votre panier attend vos pépites...',
  },
  { en: 'Estimated Total', fr: 'Total Estimé' },
  { en: 'Check my order', fr: 'Vérifier ma commande' },
  { en: 'Checkout', fr: 'Commande' },
  { en: 'Cart', fr: 'Panier' },
  { en: 'Delivery', fr: 'Livraison' },
  { en: 'Payment', fr: 'Paiement' },
  { en: 'Almost there!', fr: 'Vous y êtes presque !' },
  {
    en: 'Review your items and fill in delivery details.',
    fr: 'Vérifiez vos articles et renseignez les informations de livraison.',
  },
  { en: 'Order Summary', fr: 'Récapitulatif de la commande' },
  { en: 'Grand Total', fr: 'Total général' },
  { en: 'Delivery Details', fr: 'Détails de livraison' },
  { en: 'Delivery Type', fr: 'Type de livraison' },
  { en: 'Select a delivery type.', fr: 'Sélectionnez un type de livraison.' },
  { en: 'Payment Method', fr: 'Mode de paiement' },
  { en: 'Choose a payment method.', fr: 'Choisissez un mode de paiement.' },
  { en: 'Phone number is required.', fr: 'Le numéro de téléphone est obligatoire.' },
  { en: 'Street Address', fr: 'Adresse' },
  { en: 'Street address is required.', fr: "L'adresse est obligatoire." },
  { en: 'City is required.', fr: 'La ville est obligatoire.' },
  { en: 'Set as default address', fr: 'Définir comme adresse par défaut' },
  {
    en: 'Used automatically for future orders',
    fr: 'Utilisée automatiquement pour les prochaines commandes',
  },
  { en: 'Place Order', fr: 'Passer la commande' },
  { en: 'Placing your order…', fr: 'Création de votre commande…' },
  { en: 'Secure & encrypted checkout', fr: 'Paiement sécurisé et chiffré' },
  { en: 'Card Details', fr: 'Informations de la carte' },
  {
    en: 'Your payment information is encrypted and secure',
    fr: 'Vos informations de paiement sont chiffrées et sécurisées',
  },
  { en: 'User not loaded. Please refresh.', fr: "Utilisateur non chargé. Actualisez l'application." },
  { en: 'Your cart is empty.', fr: 'Votre panier est vide.' },
  { en: 'Checkout failed. Please try again.', fr: 'La commande a échoué. Veuillez réessayer.' },
  { en: 'Invalid amount for payment', fr: 'Montant de paiement invalide' },
  { en: 'Failed to initialize payment', fr: "Échec de l'initialisation du paiement" },
  { en: 'Payment confirmation failed', fr: 'La confirmation du paiement a échoué' },
  { en: 'An unexpected error occurred', fr: 'Une erreur inattendue est survenue' },

  // Authentication
  {
    en: 'Manage all your shops from one place',
    fr: 'Gérez toutes vos boutiques depuis un seul endroit',
  },
  { en: 'Manage all your shops', fr: 'Gérez toutes vos boutiques' },
  { en: 'from one place', fr: 'depuis un seul endroit' },
  { en: 'Access your seller space', fr: 'Accédez à votre espace vendeur' },
  { en: 'Sign in', fr: 'Connexion' },
  { en: 'Log in', fr: 'Se connecter' },
  { en: 'Sign in with Google', fr: 'Se connecter avec Google' },
  { en: 'Forgot password?', fr: 'Mot de passe oublié ?' },
  { en: 'No account yet?', fr: 'Pas encore de compte ?' },
  { en: 'Create an account', fr: 'Créer un compte' },
  {
    en: 'Create your account to start shopping',
    fr: 'Créez votre compte pour commencer vos achats',
  },
  { en: 'First name', fr: 'Prénom' },
  { en: 'Last name', fr: 'Nom' },
  { en: 'Username', fr: "Nom d'utilisateur" },
  { en: 'Min 6 characters', fr: '6 caractères minimum' },
  { en: 'I agree to the', fr: "J'accepte les" },
  { en: 'Terms of Service', fr: "Conditions d'utilisation" },
  { en: 'Privacy Policy', fr: 'Politique de confidentialité' },
  { en: 'Create account', fr: 'Créer mon compte' },
  { en: 'Already have an account?', fr: 'Vous avez déjà un compte ?' },
  { en: 'Verify OTP', fr: 'Vérifier le code' },
  {
    en: 'Enter the code sent to your email',
    fr: 'Saisissez le code envoyé à votre adresse e-mail',
  },
  { en: 'OTP Code', fr: 'Code de vérification' },
  { en: '6-digit code', fr: 'Code à 6 chiffres' },
  { en: 'Enter a valid 6-digit code', fr: 'Saisissez un code valide à 6 chiffres' },
  { en: 'OTP verified successfully!', fr: 'Code vérifié avec succès !' },
  {
    en: 'Failed to verify OTP. Please try again.',
    fr: 'Échec de la vérification du code. Veuillez réessayer.',
  },
  {
    en: 'An error occurred during registration.',
    fr: "Une erreur s'est produite pendant l'inscription.",
  },
  {
    en: 'Registration failed. Please check your network connection.',
    fr: "L'inscription a échoué. Vérifiez votre connexion réseau.",
  },
  { en: 'Change Password', fr: 'Modifier le mot de passe' },
  { en: 'change-password works!', fr: 'Modification du mot de passe' },

  // OAuth callback
  { en: 'Securing your session', fr: 'Sécurisation de votre session' },
  {
    en: 'Connecting to Central Market services…',
    fr: 'Connexion aux services Central Market…',
  },
  { en: 'Identity verified', fr: 'Identité vérifiée' },
  { en: 'Securing credentials', fr: 'Sécurisation des identifiants' },
  { en: 'Establishing connection', fr: 'Établissement de la connexion' },
  { en: 'Secure handshake · TLS 1.3', fr: 'Connexion sécurisée · TLS 1.3' },

  // Profile and footer
  { en: 'Profile', fr: 'Profil' },
  { en: 'Customer', fr: 'Client' },
  { en: 'Delivery Driver', fr: 'Livreur' },
  { en: 'Administrator', fr: 'Administrateur' },
  { en: 'Manager', fr: 'Responsable' },
  { en: 'Seller', fr: 'Vendeur' },
  { en: 'Welcome', fr: 'Bienvenue' },
  { en: 'Sign in to your account', fr: 'Connectez-vous à votre compte' },
  { en: 'QUICK ACCESS', fr: 'ACCÈS RAPIDE' },
  { en: 'Orders', fr: 'Commandes' },
  { en: 'Nearby', fr: 'Proximité' },
  { en: 'Validate delivery', fr: 'Valider livraison' },
  { en: 'STORE', fr: 'BOUTIQUE' },
  { en: 'Create a shop', fr: 'Créer une boutique' },
  { en: 'Launch your business', fr: 'Lancez votre activité' },
  { en: 'Become a delivery driver', fr: 'Devenir livreur' },
  { en: 'Earn money by delivering', fr: 'Gagnez en livrant' },
  { en: 'HELP', fr: 'AIDE' },
  { en: 'Support', fr: 'Support' },
  { en: 'Chat with our team', fr: 'Discutez avec notre équipe' },
  { en: 'Help & FAQ', fr: 'Aide & FAQ' },
  { en: 'Find answers', fr: 'Trouvez des réponses' },
  { en: 'Sign Out', fr: 'Déconnexion' },
  { en: 'MY ACCOUNT', fr: 'MON COMPTE' },
  { en: 'My Orders', fr: 'Mes commandes' },
  { en: 'Track & manage orders', fr: 'Suivre et gérer les commandes' },
  { en: 'Wishlist', fr: 'Favoris' },
  { en: 'Your saved items', fr: 'Vos articles enregistrés' },
  { en: 'Addresses', fr: 'Adresses' },
  { en: 'Delivery locations', fr: 'Adresses de livraison' },
  { en: 'Payment Methods', fr: 'Modes de paiement' },
  { en: 'Cards & mobile money', fr: 'Cartes et Mobile Money' },
  { en: 'Notifications', fr: 'Notifications' },
  { en: 'Alerts & updates', fr: 'Alertes et mises à jour' },
  { en: 'ACCOUNT & SECURITY', fr: 'COMPTE ET SÉCURITÉ' },
  { en: 'Settings', fr: 'Paramètres' },
  { en: 'Preferences & security', fr: 'Préférences et sécurité' },
  { en: 'Help & Support', fr: 'Aide et assistance' },
  { en: 'FAQs & contact us', fr: 'FAQ et contact' },
  { en: '2FA On', fr: '2FA activée' },
  { en: 'Locked', fr: 'Verrouillé' },
  { en: 'Cards', fr: 'Cartes' },
  { en: 'settings works!', fr: 'Paramètres' },
  { en: 'Login required', fr: 'Connexion requise' },
  {
    en: 'You must be logged in to create a shop.',
    fr: 'Vous devez être connecté pour créer une boutique.',
  },

  // Orders and tracking
  { en: 'ORDER', fr: 'COMMANDE' },
  { en: 'Order', fr: 'Commande' },
  { en: 'Order Ref', fr: 'Réf. commande' },
  { en: 'Order Details', fr: 'Détails de la commande' },
  { en: 'Order Confirmation', fr: 'Confirmation de commande' },
  { en: 'Order Summary', fr: 'Récapitulatif de la commande' },
  { en: 'Order Progress', fr: 'Progression de la commande' },
  { en: 'Order Placed', fr: 'Commande passée' },
  { en: 'Order Placed!', fr: 'Commande passée !' },
  {
    en: "We've received your order and it's being processed.",
    fr: 'Nous avons reçu votre commande et elle est en cours de traitement.',
  },
  { en: 'Awaiting Payment', fr: 'En attente du paiement' },
  { en: 'Payment Confirmed', fr: 'Paiement confirmé' },
  { en: 'Order Confirmed', fr: 'Commande confirmée' },
  { en: 'Created', fr: 'Créée' },
  { en: 'Draft', fr: 'Brouillon' },
  { en: 'Pending', fr: 'En attente' },
  { en: 'Payment Pending', fr: 'Paiement en attente' },
  { en: 'Confirming', fr: 'Confirmation en cours' },
  { en: 'Paid', fr: 'Payée' },
  { en: 'Confirmed', fr: 'Confirmée' },
  { en: 'Preparing', fr: 'En préparation' },
  { en: 'Ready', fr: 'Prête' },
  { en: 'On the way', fr: 'En chemin' },
  { en: 'Shipped', fr: 'Expédiée' },
  { en: 'Delivered', fr: 'Livrée' },
  { en: 'Completed', fr: 'Terminée' },
  { en: 'Cancelled', fr: 'Annulée' },
  { en: 'Failed', fr: 'Échouée' },
  { en: 'Load more orders', fr: 'Charger plus de commandes' },
  { en: 'No orders yet', fr: 'Aucune commande' },
  {
    en: 'No orders match this filter. Try a different status.',
    fr: 'Aucune commande ne correspond à ce filtre. Essayez un autre statut.',
  },
  {
    en: 'Your order history will appear here once you start shopping.',
    fr: 'Votre historique de commandes apparaîtra ici après votre premier achat.',
  },
  { en: 'Search by reference…', fr: 'Rechercher par référence…' },
  { en: 'Loading order details…', fr: 'Chargement de la commande…' },
  { en: 'Loading your order…', fr: 'Chargement de votre commande…' },
  { en: 'Delivery fee', fr: 'Frais de livraison' },
  { en: 'Delivery type', fr: 'Type de livraison' },
  { en: 'Delivery Address', fr: 'Adresse de livraison' },
  { en: 'Delivery Note', fr: 'Note de livraison' },
  { en: 'Payment Summary', fr: 'Récapitulatif du paiement' },
  { en: 'Shop subtotal', fr: 'Sous-total de la boutique' },
  { en: 'Total charged', fr: 'Total facturé' },
  { en: 'Est. delivery:', fr: 'Livraison estimée :' },
  { en: 'Delivered on', fr: 'Livrée le' },
  { en: 'Order not found', fr: 'Commande introuvable' },
  {
    en: "We couldn't load this order. Please try again.",
    fr: "Impossible de charger cette commande. Veuillez réessayer.",
  },
  { en: 'Invalid order ID', fr: 'Identifiant de commande invalide' },
  { en: 'Unable to load order', fr: 'Impossible de charger la commande' },
  { en: 'Unable to load address', fr: "Impossible de charger l'adresse" },
  { en: 'Order not loaded', fr: 'Commande non chargée' },
  { en: 'Missing payment data', fr: 'Informations de paiement manquantes' },

  // Payments
  { en: 'Complete Payment', fr: 'Finaliser le paiement' },
  { en: 'Pay on Delivery', fr: 'Payer à la livraison' },
  { en: 'Cash on Delivery', fr: 'Paiement à la livraison' },
  { en: 'Stripe payment', fr: 'Paiement Stripe' },
  {
    en: 'A confirmation request will be sent to your mobile number',
    fr: 'Une demande de confirmation sera envoyée sur votre téléphone',
  },
  { en: 'Please have', fr: 'Veuillez préparer' },
  { en: 'ready when your order arrives.', fr: "à la réception de votre commande." },
  {
    en: 'Please check your phone for the confirmation code.',
    fr: 'Consultez votre téléphone pour obtenir le code de confirmation.',
  },
  { en: 'Payment failed. Try again.', fr: 'Le paiement a échoué. Réessayez.' },
  { en: 'Unsupported payment method', fr: 'Mode de paiement non pris en charge' },
  { en: 'Payment canceled.', fr: 'Paiement annulé.' },
  { en: 'Payment failed. Please retry.', fr: 'Paiement échoué. Réessayez.' },
  { en: 'The payment was declined by the bank.', fr: 'Le paiement a été refusé par la banque.' },
  {
    en: 'Payment is being confirmed. Check your order again in a few moments.',
    fr: 'Paiement en cours de confirmation. Vérifiez votre commande dans quelques instants.',
  },
  { en: 'Server connection error.', fr: 'Erreur de connexion au serveur.' },
  { en: 'Payment Successful!', fr: 'Paiement réussi !' },
  {
    en: 'Your payment has been confirmed and your order is now being prepared.',
    fr: 'Votre paiement est confirmé et votre commande est en préparation.',
  },
  { en: 'Amount Paid', fr: 'Montant payé' },
  { en: 'Download Invoice', fr: 'Télécharger la facture' },
  { en: 'Track My Order', fr: 'Suivre ma commande' },
  { en: 'Payment canceled', fr: 'Paiement annulé' },
  {
    en: 'Your payment was not completed. No amount was charged to your card.',
    fr: "Votre paiement n'a pas été finalisé. Aucun montant n'a été débité de votre carte.",
  },
  { en: 'Confirming your payment…', fr: 'Confirmation de votre paiement…' },
  {
    en: 'Please wait a few moments while we verify your Stripe transaction.',
    fr: 'Merci de patienter quelques instants, nous vérifions votre transaction Stripe.',
  },
  { en: 'Verification pending', fr: 'Vérification en attente' },
  { en: 'Payment reference not found.', fr: 'Référence de paiement introuvable.' },
  { en: 'Payment Success', fr: 'Paiement réussi' },
  { en: 'Payment Canceled', fr: 'Paiement annulé' },
  { en: 'Payment Policy', fr: 'Politique de paiement' },
  { en: 'payment-policy works!', fr: 'Politique de paiement' },

  // Delivery driver and order validation
  { en: 'GroupinG Driver', fr: 'Livreur GroupinG' },
  { en: 'Become a Delivery Driver', fr: 'Devenir livreur', aliases: ['Devenir Livreur'] },
  {
    en: 'Join the GroupinG team and start delivering near you.',
    fr: "Rejoignez l'équipe GroupinG et commencez à livrer près de chez vous.",
  },
  { en: 'License plate', fr: "Plaque d'immatriculation" },
  {
    en: 'License plate required — between 4 and 15 alphanumeric characters.',
    fr: 'Plaque requise — entre 4 et 15 caractères alphanumériques.',
  },
  { en: 'Vehicle type', fr: 'Type de véhicule' },
  { en: 'Select your vehicle...', fr: 'Sélectionnez votre véhicule...' },
  {
    en: 'Please select a vehicle type.',
    fr: 'Veuillez sélectionner un type de véhicule.',
  },
  { en: 'I accept the', fr: "J'accepte la" },
  {
    en: 'privacy policy',
    fr: 'politique de confidentialité',
  },
  {
    en: 'of GroupinG, as well as the processing of my location data.',
    fr: 'de GroupinG, ainsi que le traitement de mes données de localisation.',
  },
  { en: 'Registering...', fr: 'Enregistrement...' },
  { en: 'Submit my registration', fr: 'Valider mon inscription' },
  { en: 'Flexible earnings', fr: 'Revenus flexibles' },
  { en: 'Flexible hours', fr: 'Horaires libres' },
  { en: 'Insurance included', fr: 'Assurance incluse' },
  {
    en: 'By registering, you confirm that you hold a valid driving licence.',
    fr: "En vous inscrivant, vous confirmez être titulaire d'un permis valide.",
  },
  { en: 'General terms', fr: 'Conditions générales' },
  { en: 'Logistics', fr: 'Logistique' },
  { en: 'Order Validation', fr: 'Validation de Commande' },
  {
    en: 'Check or complete the validation token below.',
    fr: 'Vérifiez ou complétez le jeton de validation ci-dessous.',
  },
  { en: 'Validation Code', fr: 'Code de Validation' },
  { en: 'Validating...', fr: 'Validation en cours...' },
  { en: 'Validate Order', fr: 'Valider la Commande' },
  { en: 'No validation code found.', fr: 'Aucun code de validation trouvé.' },
  { en: 'Order validated successfully!', fr: 'Commande validée avec succès !' },
  {
    en: 'An error occurred while validating the order.',
    fr: 'Erreur lors de la validation de la commande.',
  },
  { en: 'Scanner order', fr: 'Scanner une commande' },
  { en: 'validate-order works!', fr: 'Validation de commande' },
  { en: 'An error occurred. Please try again.', fr: 'Une erreur est survenue. Veuillez réessayer.' },

  // Help and support
  { en: 'Find answers and video tutorials for GroupinG', fr: 'Trouvez des réponses et des tutoriels vidéo pour GroupinG' },
  { en: 'Video Demonstrations', fr: 'Démonstrations vidéo' },
  { en: 'Frequently Asked Questions', fr: 'Questions fréquentes' },
  { en: 'Still need help?', fr: "Besoin d'aide ?" },
  {
    en: "If you couldn't find the answer you were looking for, our support team is available.",
    fr: "Si vous n'avez pas trouvé votre réponse, notre équipe d'assistance est disponible.",
  },
  { en: 'Contact Support via Email', fr: "Contacter l'assistance par e-mail" },
  { en: 'How to Create an Account', fr: 'Comment créer un compte' },
  {
    en: 'Follow this quick walkthrough to register and secure your profile on GroupinG.',
    fr: 'Suivez ce guide rapide pour vous inscrire et sécuriser votre profil GroupinG.',
  },
  { en: 'Placing Your First Group Order', fr: 'Passer votre première commande groupée' },
  {
    en: 'Learn the process of bulk purchasing and locking orders with your community.',
    fr: 'Découvrez comment effectuer des achats groupés et confirmer les commandes avec votre communauté.',
  },
  { en: 'Account & Security', fr: 'Compte et sécurité' },
  { en: 'Payments & Invoices', fr: 'Paiements et factures' },
  { en: 'Order Tracking', fr: 'Suivi des commandes' },
  { en: 'What should I do if I lost my password?', fr: "Que faire si j'ai perdu mon mot de passe ?" },
  {
    en: 'On the sign-in screen, tap the "Forgot Password?" link. Enter your registered email address, and we will transmit a secure password reset link to safely restore your access.',
    fr: "Sur l'écran de connexion, appuyez sur « Mot de passe oublié ? ». Saisissez votre adresse e-mail afin de recevoir un lien sécurisé de réinitialisation.",
  },
  { en: 'Where can I find my invoice?', fr: 'Où puis-je trouver ma facture ?' },
  {
    en: 'Your receipt is processed instantly. A digital invoice is dispatched to your registered email immediately, and you can also download it directly inside the app under "My Orders".',
    fr: "Votre reçu est traité instantanément. Une facture numérique est envoyée à votre adresse e-mail et peut aussi être téléchargée depuis « Mes commandes ».",
  },
  { en: 'How do I track my active order?', fr: 'Comment suivre ma commande en cours ?' },
  {
    en: 'Go directly to the "Track Order" dashboard from your main navigation bar to observe a real-time tracking interface showing the precise coordinates of your delivery carrier.',
    fr: "Ouvrez le suivi de commande depuis la navigation principale pour consulter en temps réel l'avancement de votre livraison.",
  },

  // Legal pages
  { en: 'Last Updated: June 2026', fr: 'Dernière mise à jour : juin 2026' },
  {
    en: 'GroupinG ("we", "us", "our") operates this mobile application ecosystem. This policy explains how we collect, use, share, disclose, and protect your information when you create a profile or interact with our services.',
    fr: 'GroupinG (« nous », « notre ») exploite cet écosystème mobile. Cette politique explique comment nous collectons, utilisons, partageons et protégeons vos informations lorsque vous créez un profil ou utilisez nos services.',
  },
  { en: '1. Types of Data We Collect', fr: '1. Types de données collectées' },
  {
    en: 'We collect personal data that you intentionally provide to us when registering on the Platform. This explicitly includes:',
    fr: 'Nous collectons les données personnelles que vous fournissez volontairement lors de votre inscription, notamment :',
  },
  { en: 'Identity Data:', fr: "Données d'identité :" },
  {
    en: 'Legal first name, last name, and chosen account username metrics.',
    fr: "prénom, nom et nom d'utilisateur choisi.",
  },
  { en: 'Contact Information:', fr: 'Coordonnées :' },
  {
    en: 'Valid digital email address and verified cellular mobile phone number configurations.',
    fr: 'adresse e-mail valide et numéro de téléphone vérifié.',
  },
  { en: 'Security Metadata:', fr: 'Données de sécurité :' },
  {
    en: 'Hashed authorization passwords used strictly for ecosystem authentication validation.',
    fr: "mots de passe chiffrés utilisés uniquement pour l'authentification.",
  },
  {
    en: '2. Geolocation Tracking and Device Coordinates',
    fr: "2. Géolocalisation et coordonnées de l'appareil",
  },
  {
    en: 'To facilitate modern marketplace fulfillment logistics, distance calculations, and real-time shipping carrier assignments, GroupinG utilizes internal background location service providers.',
    fr: 'Pour faciliter la logistique, le calcul des distances et l’attribution des livraisons, GroupinG utilise des services de localisation.',
  },
  {
    en: 'With your explicit hardware runtime consent, we track your exact geographic location data points, including',
    fr: 'Avec votre consentement explicite, nous pouvons traiter votre position géographique, notamment la',
  },
  { en: 'latitude', fr: 'latitude' },
  { en: 'and', fr: 'et la' },
  { en: 'longitude', fr: 'longitude' },
  {
    en: '. You can revoke device authorization permissions at any moment via your smartphone operating system settings, which may restrict regional storefront routing functions.',
    fr: ". Vous pouvez retirer cette autorisation à tout moment dans les réglages de votre téléphone, ce qui peut limiter certaines fonctions de proximité.",
  },
  { en: '3. How Your Information Is Applied', fr: '3. Utilisation de vos informations' },
  {
    en: 'We process collected user data based on legitimate business operations, transactional executions, and strict compliance duties, including to:',
    fr: 'Nous traitons les données collectées pour assurer le fonctionnement du service, notamment pour :',
  },
  {
    en: 'Establish, maintain, monitor, and safeguard your structural login profile.',
    fr: 'Créer, maintenir et sécuriser votre profil utilisateur.',
  },
  {
    en: 'Process checkout operations, manage catalog interactions, and coordinate shipping tracking routes.',
    fr: 'Traiter les commandes, gérer le catalogue et coordonner le suivi des livraisons.',
  },
  {
    en: 'Distribute verification security codes (such as security OTP payloads) via email or phone lines.',
    fr: 'Envoyer des codes de vérification par e-mail ou téléphone.',
  },
  {
    en: 'Identify, isolate, and mitigate digital fraud vulnerabilities or multi-accounting exploits.',
    fr: 'Détecter et prévenir les fraudes et les abus.',
  },
  { en: '4. Third-Party Data Disclosures & Sharing', fr: '4. Partage des données avec des tiers' },
  {
    en: 'We do not sell, trade, or rent your private personal details to third-party marketing brokers. Your data is shared exclusively with designated operations providers necessary to process platform workflows, including:',
    fr: 'Nous ne vendons ni ne louons vos données personnelles. Elles sont partagées uniquement avec les prestataires nécessaires au fonctionnement de la plateforme, notamment :',
  },
  {
    en: 'Payment gateway clearing microservices to authorize credit card or mobile money transfers.',
    fr: 'Les prestataires de paiement chargés des cartes et du Mobile Money.',
  },
  {
    en: 'Registered independent logistics, courier firms, and regional delivery fulfillment drivers.',
    fr: 'Les prestataires logistiques, transporteurs et livreurs enregistrés.',
  },
  {
    en: 'Legal authorities or regulatory state bodies when explicitly required to enforce system terms or local legislation.',
    fr: 'Les autorités compétentes lorsque la loi l’exige.',
  },
  { en: '5. Data Retention Architecture', fr: '5. Conservation des données' },
  {
    en: 'We maintain your personal profile variables and geolocation trace histories inside our secure cloud data infrastructure for only as long as your account configuration remains actively registered. In the event of voluntary account closure requests, data segments are permanently scrubbed, anonymized, or masked from active lookup indexing pipelines within 30 business days, excluding details bound by corporate financial audit obligations.',
    fr: 'Nous conservons les données de votre profil et les informations de localisation uniquement pendant la durée nécessaire au fonctionnement de votre compte. Après une demande de fermeture, elles sont supprimées, anonymisées ou masquées sous 30 jours ouvrés, sauf obligation légale de conservation.',
  },
  { en: '6. User Security Rights and Protections', fr: '6. Vos droits et protections' },
  {
    en: 'Depending on your regional legal environment, you hold direct, actionable rights regarding your personal information records. These include the right to inspect data values under our custody, update profile metrics, or completely object to specific localized mobile money notification routines. You can trigger these directly by filing an official request to our privacy team.',
    fr: "Selon la législation applicable, vous pouvez accéder à vos données, les corriger ou vous opposer à certains traitements. Vous pouvez exercer ces droits en contactant notre équipe chargée de la confidentialité.",
  },

  // Error and empty pages
  { en: 'Page Missing', fr: 'Page introuvable' },
  { en: 'Lost in the Market?', fr: 'Perdu dans le marché ?' },
  {
    en: "The link you followed might be broken, or the page was relocated. Let’s get you back to tracking your purchases.",
    fr: 'Le lien suivi est peut-être incorrect ou la page a été déplacée. Revenons à vos achats.',
  },
  { en: 'Page Not Found', fr: 'Page introuvable' },
  { en: 'Blank', fr: 'Accueil' },
  { en: 'Ready to create an app?', fr: 'Prêt à utiliser l’application ?' },
  { en: 'Start with Ionic', fr: 'Commencer avec Ionic' },
  { en: 'UI Components', fr: "Composants d'interface" },
  { en: 'Loan rate configuration', fr: 'Configuration du taux de prêt', aliases: ['loan-rate-congigs works!'] },
];

const normalize = (value: string): string => value.replace(/\s+/g, ' ').trim();

const TRANSLATION_LOOKUP = new Map<string, TranslationEntry>();

for (const entry of TRANSLATIONS) {
  const sources = [entry.en, entry.fr, ...(entry.aliases ?? [])];
  for (const source of sources) {
    TRANSLATION_LOOKUP.set(normalize(source), entry);
  }
}

@Injectable({ providedIn: 'root' })
export class LanguageService implements OnDestroy {
  private readonly languageSubject = new BehaviorSubject<AppLanguage>('en');
  readonly language$ = this.languageSubject.asObservable();

  private readonly textStates = new WeakMap<Text, TranslationState>();
  private readonly attributeStates = new WeakMap<Element, Map<string, TranslationState>>();

  private observer?: MutationObserver;
  private readonly shadowObservers = new WeakMap<ShadowRoot, MutationObserver>();
  private readonly shadowObserverHandles = new Set<MutationObserver>();
  private initialized = false;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  get currentLanguage(): AppLanguage {
    return this.languageSubject.value;
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.translateDocument();
      return;
    }

    const storedLanguage = await this.readStoredLanguage();
    const initialLanguage = storedLanguage ?? this.detectDeviceLanguage();

    this.languageSubject.next(initialLanguage);
    this.initialized = true;
    this.updateDocumentLanguage();
    this.startObserver();
    this.translateDocument();
  }

  async setLanguage(language: AppLanguage): Promise<void> {
    if (language !== 'en' && language !== 'fr') {
      return;
    }

    this.languageSubject.next(language);
    this.updateDocumentLanguage();
    this.translateDocument();

    try {
      await Preferences.set({
        key: LANGUAGE_PREFERENCE_KEY,
        value: language,
      });
    } catch (error) {
      console.warn('[i18n] Unable to persist the selected language.', error);
    }
  }

  async toggleLanguage(): Promise<void> {
    await this.setLanguage(this.currentLanguage === 'fr' ? 'en' : 'fr');
  }

  translate(value: string, language: AppLanguage = this.currentLanguage): string {
    if (!value) {
      return value;
    }

    const leadingWhitespace = value.match(/^\s*/)?.[0] ?? '';
    const trailingWhitespace = value.match(/\s*$/)?.[0] ?? '';
    const core = normalize(value);

    if (!core) {
      return value;
    }

    const entry = TRANSLATION_LOOKUP.get(core);
    const translatedCore = entry ? entry[language] : this.translateDynamic(core, language);

    return `${leadingWhitespace}${translatedCore}${trailingWhitespace}`;
  }

  refresh(): void {
    this.translateDocument();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.shadowObserverHandles.forEach((observer) => observer.disconnect());
    this.shadowObserverHandles.clear();
  }

  private async readStoredLanguage(): Promise<AppLanguage | null> {
    try {
      const { value } = await Preferences.get({ key: LANGUAGE_PREFERENCE_KEY });
      return value === 'en' || value === 'fr' ? value : null;
    } catch (error) {
      console.warn('[i18n] Unable to read the stored language.', error);
      return null;
    }
  }

  private detectDeviceLanguage(): AppLanguage {
    const locale =
      this.document.defaultView?.navigator.language ??
      this.document.documentElement.lang ??
      'en';

    return locale.toLowerCase().startsWith('fr') ? 'fr' : 'en';
  }

  private updateDocumentLanguage(): void {
    this.document.documentElement.lang = this.currentLanguage;
  }

  private startObserver(): void {
    const MutationObserverConstructor = this.document.defaultView?.MutationObserver;
    const root = this.document.documentElement;

    if (!MutationObserverConstructor || !root) {
      return;
    }

    this.observer?.disconnect();
    this.observer = new MutationObserverConstructor((mutations) => {
      this.handleMutations(mutations);
    });

    this.observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
    });
  }

  private handleMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        this.translateTextNode(mutation.target as Text);
        continue;
      }

      if (mutation.type === 'attributes') {
        this.translateElementAttribute(
          mutation.target as Element,
          mutation.attributeName ?? '',
        );
        continue;
      }

      for (const node of Array.from(mutation.addedNodes)) {
        this.translateTree(node);

        // Ionic components can attach their shadow root shortly after insertion.
        this.document.defaultView?.setTimeout(() => this.translateTree(node), 0);
      }
    }
  }

  private observeShadowRoot(root: ShadowRoot): void {
    if (this.shadowObservers.has(root)) {
      return;
    }

    const MutationObserverConstructor = this.document.defaultView?.MutationObserver;
    if (!MutationObserverConstructor) {
      return;
    }

    const observer = new MutationObserverConstructor((mutations) => {
      this.handleMutations(mutations);
    });

    observer.observe(root, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...TRANSLATABLE_ATTRIBUTES],
    });

    this.shadowObservers.set(root, observer);
    this.shadowObserverHandles.add(observer);
  }

  private translateDocument(): void {
    const root = this.document.documentElement;
    if (root) {
      this.translateTree(root);
    }
  }

  private translateTree(node: Node): void {
    if (node.nodeType === Node.TEXT_NODE) {
      this.translateTextNode(node as Text);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const element = node as Element;
    if (this.shouldIgnoreElement(element)) {
      return;
    }

    this.translateElementAttributes(element);

    for (const child of Array.from(element.childNodes)) {
      this.translateTree(child);
    }

    if (element.shadowRoot) {
      this.observeShadowRoot(element.shadowRoot);

      for (const child of Array.from(element.shadowRoot.childNodes)) {
        this.translateTree(child);
      }
    }
  }

  private shouldIgnoreElement(element: Element): boolean {
    const tagName = element.tagName.toUpperCase();

    if (['SCRIPT', 'STYLE', 'CODE', 'PRE'].includes(tagName)) {
      return true;
    }

    return Boolean(
      element.closest('[data-i18n-ignore], .notranslate, [translate="no"]'),
    );
  }

  private translateTextNode(node: Text): void {
    const parent = node.parentElement;
    if (!parent || this.shouldIgnoreElement(parent)) {
      return;
    }

    const currentValue = node.data;
    let state = this.textStates.get(node);

    if (!state) {
      state = { source: currentValue, lastApplied: currentValue };
      this.textStates.set(node, state);
    } else if (currentValue !== state.lastApplied) {
      state.source = currentValue;
    }

    const translatedValue = this.translate(state.source);
    state.lastApplied = translatedValue;

    if (node.data !== translatedValue) {
      node.data = translatedValue;
    }
  }

  private translateElementAttributes(element: Element): void {
    for (const attribute of TRANSLATABLE_ATTRIBUTES) {
      this.translateElementAttribute(element, attribute);
    }
  }

  private translateElementAttribute(element: Element, attributeName: string): void {
    const normalizedAttributeName = attributeName.toLowerCase();

    if (
      !TRANSLATABLE_ATTRIBUTES.includes(
        normalizedAttributeName as (typeof TRANSLATABLE_ATTRIBUTES)[number],
      ) ||
      !element.hasAttribute(normalizedAttributeName) ||
      this.shouldIgnoreElement(element)
    ) {
      return;
    }

    const currentValue = element.getAttribute(normalizedAttributeName) ?? '';
    let states = this.attributeStates.get(element);

    if (!states) {
      states = new Map<string, TranslationState>();
      this.attributeStates.set(element, states);
    }

    let state = states.get(normalizedAttributeName);

    if (!state) {
      state = { source: currentValue, lastApplied: currentValue };
      states.set(normalizedAttributeName, state);
    } else if (currentValue !== state.lastApplied) {
      state.source = currentValue;
    }

    const translatedValue = this.translate(state.source);
    state.lastApplied = translatedValue;

    if (currentValue !== translatedValue) {
      element.setAttribute(normalizedAttributeName, translatedValue);
    }
  }

  private translateDynamic(value: string, language: AppLanguage): string {
    let match = value.match(/^(\d+)\s+items?$/i);
    if (match) {
      const count = Number(match[1]);
      return language === 'fr'
        ? `${count} article${count > 1 ? 's' : ''}`
        : `${count} item${count === 1 ? '' : 's'}`;
    }

    match = value.match(/^(\d+)\s+orders?$/i);
    if (match) {
      const count = Number(match[1]);
      return language === 'fr'
        ? `${count} commande${count > 1 ? 's' : ''}`
        : `${count} order${count === 1 ? '' : 's'}`;
    }

    match = value.match(/^Showing\s+(\d+)\s+of\s+(\d+)\s+orders$/i);
    if (match) {
      return language === 'fr'
        ? `${match[1]} commande(s) sur ${match[2]}`
        : `Showing ${match[1]} of ${match[2]} orders`;
    }

    match = value.match(/^Qty:\s*(\d+)\s*×\s*(.+)$/i);
    if (match) {
      return language === 'fr'
        ? `Qté : ${match[1]} × ${match[2]}`
        : `Qty: ${match[1]} × ${match[2]}`;
    }

    match = value.match(/^(\d+)\s+delivery$/i);
    if (match) {
      return language === 'fr'
        ? `+${match[1]} livraison`
        : `+${match[1]} delivery`;
    }

    match = value.match(/^(.+)\s+ajouté\s*!$/i);
    if (match) {
      return language === 'fr' ? `${match[1]} ajouté !` : `${match[1]} added!`;
    }

    match = value.match(/^View shop\s+(.+)$/i);
    if (match) {
      return language === 'fr'
        ? `Voir la boutique ${match[1]}`
        : `View shop ${match[1]}`;
    }

    return value;
  }
}