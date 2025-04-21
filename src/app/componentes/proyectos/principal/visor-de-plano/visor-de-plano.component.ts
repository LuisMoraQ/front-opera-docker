import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
// import { ModelLoaderService, IFCViewerService, LoadingStatus } from 'ngx-ifc-viewer';
// import { IFCModel } from 'web-ifc-three/IFC/components/IFCModel';

@Component({
  selector: 'app-visor-de-plano',
  templateUrl: './visor-de-plano.component.html',
  styleUrls: ['./visor-de-plano.component.scss']
})
export class VisorDePlanoComponent implements OnInit, AfterViewInit {
  // public models: IFCModel[] = [];

  // constructor(
  //   private _modelLoader: ModelLoaderService,
  //   private _viewer: IFCViewerService
  // ){}
  ngAfterViewInit(): void {
  
  }
  ngOnInit(): void {
  
  }

  // uploadFile(files: FileList){

  //   this._modelLoader.loadModel(files[0]).subscribe(async (status: LoadingStatus) => {

  //       // Load finished
  //       if(status.result != undefined){

  //         const model = status.result;

  //         // Add to array of models
  //         this.models.push(model);

  //         // Append model to scene
  //         this._viewer.appendModel(model);

  //       }

  //     }, 
  //     err => console.log(err))

  // }
  quitarfoco(element: any) {
    element.target.blur();
    element.target.parentElement.blur();
  }
 

}
