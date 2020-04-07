import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import Swal from 'sweetalert2';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore';
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HomeComponent implements OnInit {
  datos: any = [];
  cliente: any = [];
  titulo_modal: any = 'Titulo';
  bodyModal: any = '';
  style_barra: any = '';
  modalReference: any = '';
  persona: any = [{ id: 0, nombre: '', edad: 0, fch_nacimiento: '' }];
  public usuario = { id: '1' };
  public formGroup: FormGroup;
  // tslint:disable-next-line: max-line-length
  constructor(public modalService: NgbModal, public activeModal: NgbActiveModal, private formBuilder: FormBuilder, private db: AngularFirestore) {

    this.cargarDatos();
  }

  ngOnInit() {
    this.buildForm();
  }
  private buildForm() {
    const name = '';
    const apellido = '';
    const edad = this.cliente.edad ? this.cliente.edad : '0';
    const fch_nacio = '';
    this.formGroup = this.formBuilder.group({
      Nombres: [name, Validators.required],
      Apellidos: [apellido, Validators.required],
      Edad: [edad, Validators.required],
      fecha_nacimiento: [fch_nacio, Validators.required]
    });
  }


  setMyStyles() {
    const styles = {
       'width' : this.cliente.edad ? this.cliente.edad + '%' : '0%'
    };
    return styles;
  }


  async OpenAnalisis(content3, cliente) {
    this.cliente = cliente[0];
    this.style_barra = '';
    this.modalReference = this.modalService.open(content3, { centered: true });

  }

  closeMOdal() {

    this.modalReference.close();
  }

  changeDate(valor) {
    this.formGroup.patchValue({
      Edad: this.getAge(valor)
    });
  }


  async openModal(content, caso) {

    let media = 0;
    let contador = 0;
    let dedviacionEstandar = 0;

    await this.db.collection('clientes').valueChanges()
      .subscribe((data: any) => {
        data.map((x: any, idx: number) => {
          media = Number(x.edad) + media;
          contador++;
        });
        media = media / contador;
        dedviacionEstandar = Number(Math.sqrt(media));
        // tslint:disable-next-line: max-line-length
        this.bodyModal = caso ? 'El promedio de Edades es: ' + media.toFixed(2) : 'La Desviación Estandar es: ' + dedviacionEstandar.toFixed(2);
        this.titulo_modal = caso ? 'Promedio de Edades' : 'Desviación Estandar';
        this.modalReference = this.modalService.open(content, { centered: true });
      });


  }

  async OpenRister(content2, caso) {

    this.modalReference = this.modalService.open(content2, { centered: true });
  }


  async register() {
    const user = this.formGroup.value;

    const data = {
      'nombres': user.Nombres,
      'apellido': user.Apellidos,
      'edad': user.Edad,
      'fch_nacimiento': user.fecha_nacimiento
    };

    await this.db.collection('clientes').add(data);
    await this.cargarDatos();
    await this.buildForm();
    Swal('Se Registro el Usuario con Exito');
    await this.closeMOdal();
  }


   getActuallyDate(dateActual) {
    // tslint:disable-next-line: max-line-length
    const datestring = dateActual.getFullYear() + '-' + ('0' + (dateActual.getMonth() + 1)).slice(-2) + '-' + ('0' + dateActual.getDate()).slice(-2)  ;
    return datestring;
  }

   getAge(pBorndate) {
    const borndate: any = new Date(pBorndate.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$2/$1/$3'));
    const ageDate = new Date(Date.now() - borndate);
    const age = Math.abs(ageDate.getFullYear() - 1970);
    return age ? age : 0;
  }


  async cargarDatos() {

    await this.db.collection('clientes').valueChanges()
      .subscribe((data: any) => {
        this.persona = [];
        data.map((x: any, idx: number) => {
          const fecha = new Date();
          fecha.setFullYear(fecha.getFullYear() + (80 - x.edad));
          const probable_muerte = this.getActuallyDate(fecha);
          // tslint:disable-next-line: max-line-length
          this.persona.push({ id: idx + 1, nombre: x.nombres + ' ' + x.apellido, edad: x.edad, fch_nacimiento: x.fch_nacimiento, probable_muerte: probable_muerte });

        });

      });


  }





}
