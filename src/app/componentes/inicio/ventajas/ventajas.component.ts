import { Component, OnInit } from '@angular/core';
import { DomSanitizer,SafeUrl} from '@angular/platform-browser';

@Component({
  selector: 'app-ventajas',
  templateUrl: './ventajas.component.html',
  styleUrls: ['./ventajas.component.scss']
})
export class VentajasComponent implements OnInit {
  menuActive = false;
  selectedSection = 'section4';
  currentSection = 'section4';

  toggleMenu() {
    this.menuActive = !this.menuActive;
  }


  safeUrl1: SafeUrl;
  safeUrl2: SafeUrl;
  safeUrl3: SafeUrl;
  safeUrl4: SafeUrl;
  safeUrl5: SafeUrl;


  constructor(private sanitizer: DomSanitizer) {
    this.setSafeUrls();
  }

  setSafeUrls() {
    this.safeUrl1 = this.sanitizer.bypassSecurityTrustUrl('https://www.dropbox.com/scl/fi/mqg7wus6r1dwzyme2eec7/TrabajoColectivo.jpg?rlkey=5ss2gcqg0tg4dh480iwgqsu0i&st=5urgd83s&raw=1');
    this.safeUrl2 = this.sanitizer.bypassSecurityTrustUrl('https://www.dropbox.com/scl/fi/fnwbzrij479a5iitlznfl/3Compatibiliada.jpg?rlkey=1eh5nss7af5cy51iqhobva95v&st=3i5lo1t3&raw=1');
    this.safeUrl3 = this.sanitizer.bypassSecurityTrustUrl('https://www.dropbox.com/scl/fi/8yt08lxo43354gw8vt22u/InteligenciaInterpretacion.jpg?rlkey=ke4no5upytsrd9ogjv4e44j56&st=408l3a87&raw=1');
    this.safeUrl4 = this.sanitizer.bypassSecurityTrustUrl('https://www.dropbox.com/scl/fi/zw3ksjhvcbnwnpdxio2b3/Portabilidad.jpg?rlkey=a07vfwlsqrwy1fwxi0vzinb6c&st=5x4k79uj&raw=1');
    this.safeUrl5 = this.sanitizer.bypassSecurityTrustUrl('https://www.dropbox.com/scl/fi/ofzh9mlevpiiss6m63zcy/DataIntegral.jpeg?rlkey=xd2inyo2w0lkb70lfh7t0j6yk&st=amitf227&raw=1');
  }
  ngOnInit(): void {
  }

}
