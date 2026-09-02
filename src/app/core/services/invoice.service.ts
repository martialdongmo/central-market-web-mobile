import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class InvoiceService {

    private readonly API_URL = environment.invoiceEndpoint;

    private http = inject(HttpClient);

    downloadInvoicePdf(orderId: string): Observable<Blob> {
        return this.http.get(`${this.API_URL}/${orderId}/pdf`, {
            responseType: 'blob'
        });
    }

    async downloadInvoice(orderId: string): Promise<void> {
        try {
            const blob = await this.http.get(`${this.API_URL}/${orderId}/pdf`, {
                responseType: 'blob'
            }).toPromise();

            if (!blob) {
                throw new Error('Failed to download invoice');
            }

            const arrayBuffer = await blob.arrayBuffer();

            // Check if we're on native platform
            const { Capacitor } = await import('@capacitor/core');

            if (Capacitor.isNativePlatform()) {
                // Native platform: Use Capacitor Filesystem to save
                const { Filesystem, Directory } = await import('@capacitor/filesystem');
                const { Share } = await import('@capacitor/share');

                // Save to file system
                const base64Data = this.arrayBufferToBase64(arrayBuffer);
                const fileName = `invoice_${orderId}.pdf`;

                await Filesystem.writeFile({
                    path: fileName,
                    data: base64Data,
                    directory: Directory.External,
                    recursive: true
                });

                // Share the file
                await Share.share({
                    title: `Invoice ${orderId}`,
                    text: 'Please find your invoice attached.',
                    url: `data:application/pdf;base64,${base64Data}`,
                    dialogTitle: 'Share Invoice'
                });
            } else {
                // Web platform: Use existing download logic
                const url = window.URL.createObjectURL(new Blob([arrayBuffer]));
                const a = document.createElement('a');
                a.href = url;
                a.download = `invoice_${orderId}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            }
        } catch (error) {
            console.error('Error downloading and sharing invoice:', error);
            throw error;
        }
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

}
