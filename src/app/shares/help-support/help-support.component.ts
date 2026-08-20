import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  playCircleOutline,
  helpCircleOutline,
  chevronDownOutline,
  logoYoutube,
  chatbubbleEllipsesOutline,
  mailOutline
} from 'ionicons/icons';

interface VideoTutorial {
  title: string;
  description: string;
  youtubeUrl: string;
  safeUrl?: SafeResourceUrl;
  duration: string;
  gradientClass: string;
  isPlaying: boolean;
}

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}


@Component({
  selector: 'app-help-support',
  templateUrl: './help-support.component.html',
  styleUrls: ['./help-support.component.scss'],
  imports: [CommonModule, IonContent, IonIcon],
})
export class HelpSupportComponent {

  private sanitizer = inject(DomSanitizer);

  public tutorials: VideoTutorial[] = [

    {
      title: 'How to Create an Account',
      description: 'Follow this quick walkthrough to register and secure your profile on GroupinG.',
      youtubeUrl: 'https://www.youtube.com/shorts/znQ1ykv54Fk',
      duration: '1:45',
      gradientClass: 'from-blue-600',
      isPlaying: true
    },
    {
      title: 'How to Create a shop',
      description: 'Follow this quick walkthrough to register your shop and secure your profile on GroupinG.',
      youtubeUrl: 'https://www.youtube.com/shorts/acc_create',
      duration: '1:45',
      gradientClass: 'from-blue-600',
      isPlaying: false

    },
     {
      title: 'How to Create a Product',
      description: 'Follow this quick walkthrough to create and list your products on GroupinG.',
      youtubeUrl: 'https://www.youtube.com/shorts/acc_create',
      duration: '1:45',
      gradientClass: 'from-blue-600',
      isPlaying: false

    },
    {
      title: 'Placing Your First Group Order',
      description: 'Learn the process of bulk purchasing and locking orders with your community.',
      youtubeUrl: 'https://www.youtube.com/shorts/XaBfYW4QxEA',
      duration: '3:20',
      gradientClass: 'from-slate-700',
      isPlaying: false
    }
  ];

  public faqList: FaqItem[] = [
    {
      category: 'Account & Security',
      question: 'What should I do if I lost my password?',
      answer: 'On the sign-in screen, tap the "Forgot Password?" link. Enter your registered email address, and we will transmit a secure password reset link to safely restore your access.'
    },
    {
      category: 'Payments & Invoices',
      question: 'Where can I find my invoice?',
      answer: 'Your receipt is processed instantly. A digital invoice is dispatched to your registered email immediately, and you can also download it directly inside the app under "My Orders".'
    },
    {
      category: 'Order Tracking',
      question: 'How do I track my active order?',
      answer: 'Go directly to the "Track Order" dashboard from your main navigation bar to observe a real-time tracking interface showing the precise coordinates of your delivery carrier.'
    }
  ];
  constructor() {
    addIcons({
      playCircleOutline,
      helpCircleOutline,
      chevronDownOutline,
      logoYoutube,
      chatbubbleEllipsesOutline,
      mailOutline
    });

    // Extraction et sécurisation automatique de l'ID vidéo au démarrage
    this.tutorials.forEach(tuto => {
      const videoId = this.extractVideoId(tuto.youtubeUrl);
      if (videoId) {
        tuto.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
        );
      }
    });
  }

  private extractVideoId(url: string): string | null {
  // Gère : youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID,
  // youtube.com/shorts/ID, et les URLs avec paramètres supplémentaires
  const regExp = /(?:youtube\.com\/(?:shorts\/|embed\/|v\/|watch\?v=|watch\?.*&v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

  getFaqCategories(): string[] {
    return Array.from(new Set(this.faqList.map(item => item.category)));
  }

  getFaqsByCategory(category: string): FaqItem[] {
    return this.faqList.filter(item => item.category === category);
  }

  playVideo(tuto: VideoTutorial) {
    if (tuto.safeUrl) {
      tuto.isPlaying = true;
    }
  }


  // Point de contact direct et léger (remplace un formulaire lourd)
  contactSupport() {
    const email = 'groupingcameroon@gmail.com';
    const subject = 'GroupinG Support Request';
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}`, '_system');
  }

}
