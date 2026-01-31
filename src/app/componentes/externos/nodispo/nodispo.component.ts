import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-nodispo',
  templateUrl: './nodispo.component.html',
  styleUrls: ['./nodispo.component.scss']
})
export class NodispoComponent implements OnInit {
  mensaje=''
  constructor(
    private route:ActivatedRoute,
    
  ) {
    this.route.params.subscribe(params=>{
      this.mensaje=params['valor']
    })
  }

  ngOnInit(): void {
    console.log(this.mensaje)
  }

}
