# Cancel City — cinq vrais premiers essais

Statut : outil prêt, aucun participant encore observé. Les corrections viennent d’une lecture du code, pas d’une validation visuelle ou d’un test humain.

## Le lien à donner

https://cancel-city-gacha.tokieth.chatgpt.site/playtest/

La personne accepte un enregistrement local puis joue depuis l’accueil normal. Ne pas donner le lien `?clash=` à un testeur revenant pour le faire passer pour un nouveau joueur. L’outil classe les sauvegardes et intros déjà terminées comme un retour. Il ne supprime aucune progression.

Utiliser un profil de navigateur neuf pour chaque nouvelle personne. Sur téléphone, garder le même onglet jusqu’au téléchargement. Le mode privé peut limiter la sauvegarde et le partage : noter son utilisation, ne pas le confondre avec un profil normal. Le rapport se trouve uniquement dans le stockage de session de cet onglet ; un navigateur peut restaurer sa session. Ne pas compter sur cet outil pour récupérer les abandons après fermeture.

## Cinq personnes, sans cours préalable

Choisir cinq personnes qui n’ont jamais vu le jeu, dont quelques profils crypto/memes et au moins une personne peu habituée aux jeux de cartes. Utiliser leurs téléphones si possible. Affecter seulement P1 à P5 dans la feuille, sans nom ni coordonnées.

Dire exactement : « Voici un jeu gratuit. Utilise-le comme tu veux. Tu peux arrêter quand tu veux. »

Pendant les trente premières secondes, ne pas expliquer le fonctionnement ni indiquer un bouton. Noter le premier clic, les pauses, le passage auquel la personne réagit, et ses mots exacts. Une réaction amusée ne prouve pas qu’elle souhaite continuer ; noter les deux séparément.

Laisser jouer jusqu’à cinq minutes, ou jusqu’à son arrêt spontané. Si elle demande de l’aide, noter le blocage avant d’aider et marquer la suite comme assistée.

Après le jeu, demander :

- « Qu’est-ce que tu viens de faire ? »
- « Qu’est-ce qui t’a donné envie de continuer, ou d’arrêter ? »
- « Qu’aurais-tu fait ensuite ? »
- « Tu y rejouerais demain ? Pourquoi ? »

Faire terminer le test avec END TEST. La personne peut remplir trois réponses, télécharger son JSON et décider de le transmettre. Ne pas envoyer de message ou récupérer un rapport sans son accord. Les notes libres peuvent contenir des données personnelles : demander de les omettre.

## Ce que le rapport permet de vérifier

Les temps commencent au clic Start Playing, avant la navigation vers l’accueil. Ils comprennent le chargement et les périodes où l’onglet est masqué. Ce ne sont ni un LCP, ni des statistiques de rétention. Une réponse à « rejouer demain » est une intention déclarée, pas un retour mesuré.

Le rapport contient seulement les dimensions de fenêtre au départ, la catégorie nouveau/retour, les pages de jeu autorisées sans paramètres, les jalons de l’intro, les ouvertures/révélations/collectes de packs et les parties enregistrées. Les visites de Battle peuvent mener aux leçons ou à la practice ; elles ne prouvent pas qu’une partie a commencé. Il ne stocke aucun identifiant de sauvegarde, alias, inventaire, phrase cliquée ou capture. Le tirage aléatoire et le moteur ne changent pas.

Le journal conserve les 249 premières étapes, plus la fin du test. Il ne remplace pas l’observateur : comprendre une règle, rire et vouloir continuer nécessitent un retour humain.

## Décision après les cinq essais

Pour chaque personne, relever : délai avant Play, réponse choisie, verdict compris ou non, pack collecté ou non, seconde activité choisie sans aide, point d’arrêt et raison donnée. Écrire « non atteint » si une étape manque, pas zéro seconde.

Classer au plus trois blocages : d’abord les actions impossibles ou pertes de progression ; ensuite les incompréhensions qui reviennent ; enfin le manque d’envie exprimé. Corriger ces trois points avant d’ajouter une nouvelle activité. Cinq essais servent à trouver des problèmes, pas à annoncer un taux de conversion fiable.

## Contrôle téléphone encore à faire

L’accès navigateur automatisé a été refusé pour cette session. Aucun rendu alternatif ni contournement n’a été utilisé. À vérifier réellement sur un petit téléphone puis un écran plus large :

- Le bouton Play est accessible, les trois réponses se lisent sans défilement horizontal, le verdict apparaît après la réponse, y compris avec texte agrandi.
- Le premier pack se révèle et se collecte ; après réouverture, la collection est conservée.
- Un ancien joueur recevant un défi voit une action de pack cohérente, sans cadeau promis à tort.
- Le téléchargement/partage de PNG fonctionne sur l’appareil, puis le destinataire peut ouvrir le lien.
- Au clavier, Play mène à une réponse ; le verdict reçoit le focus ; chaque action possède un focus visible.

## Corrections livrées avant ces essais

- Sortir d’un combat terminé ne lance plus une réhydratation qui empêchait l’action d’enregistrement en invité/cloud.
- La sortie de l’intro distingue premier pack, pack inachevé et joueur ayant déjà ouvert des packs.
- Le focus suit les changements de scène ; une variante compacte réduit la scène d’invitation sur écran court. L’effet visuel reste à confirmer sur appareil.
- Après la première équipe sauvegardée, le prochain lien mène à la fondation du bloc si la ville n’existe pas encore.
- La practice signale une écriture refusée au lieu de promettre une sauvegarde réussie.

Feuille d’observation : [playtest-observations.csv](playtest-observations.csv). Les lignes P1–P5 sont volontairement vides.
