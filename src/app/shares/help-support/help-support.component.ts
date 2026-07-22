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
      youtubeUrl: 'https://youtu.be/Bwa_NnnoC5Y',
      duration: '1:45',
      gradientClass: 'from-blue-600',
      isPlaying: true
    },
    {
      title: 'How to Create an Account',
      description: 'Follow this quick walkthrough to register and secure your profile on GroupinG.',
      youtubeUrl: 'https://youtube.com/watch?v=acc_create',
      duration: '1:45',
      gradientClass: 'from-blue-600',
      isPlaying: false

    },
    {
      title: 'Placing Your First Group Order',
      description: 'Learn the process of bulk purchasing and locking orders with your community.',
      youtubeUrl: 'https://youtube.com/watch?v=first_order',
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
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
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
    const email = 'support@grouping.com';
    const subject = 'GroupinG Support Request';
    window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}`, '_system');
  }

}
