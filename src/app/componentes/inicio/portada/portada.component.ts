import { Component, OnInit, HostListener, Input, ViewChild } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';



@Component({
  selector: 'app-portada',
  templateUrl: './portada.component.html',
  styleUrls: ['./portada.component.scss']
})

export class PortadaComponent implements OnInit {


  selectedSection: string = '';
  currentSection = '';
  menuActive = false;

  showSection(section: string) {
    this.selectedSection = section;
    this.menuActive = false;
  }

  constructor(private router: Router) {

  }

  isSidebarHidden = false
  async ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateSelectedSection(event.url);
      });
  }
  updateSelectedSection(url: string) {
    switch (url) {
      case '/nosotros':
        this.selectedSection = 'section1';
        this.menuActive = false;
        break;
      case '/modulos':
        this.selectedSection = 'section2';
        this.menuActive = false;
        break;
      case '/planes':
        this.selectedSection = 'section3';
        this.menuActive = false;
        break;
      case '/ventajas':
        this.selectedSection = 'section4';
        this.menuActive = false;
        break;
      case '/contacto':
        this.selectedSection = 'section5';
        this.menuActive = false;
        break;
      case '/convocatorias':
        this.selectedSection = 'section6';
        this.menuActive = false;
        break;
      default:
        this.selectedSection = '';
        break;
    }
  }

  toggleMenu() {
    this.menuActive = !this.menuActive;
    this.isSidebarHidden = !this.isSidebarHidden;
  }

}

