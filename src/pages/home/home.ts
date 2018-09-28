import { GLOBAL } from './../../providers/fecha/globales';
import { Http, Headers } from '@angular/http';
import { ApiServicesProvider } from '../../providers/api-services/api-services';
import { Component } from '@angular/core';
import { NavController, ToastController, LoadingController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { PlazasPage } from '../plazas/plazas';
import jsSHA from 'jssha'
import 'rxjs/add/operator/map';
import { DatabaseProvider } from '../../providers/database/database';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {


  identificacion: number; //Identificación del inicio de sesión
  contrasenia: string; //Contraseña del inicio de sesión

  //Datos para storage
  keyRecaudador: string = "nomRecaudadorData";
  recaudador: any = '';
  nombreusuario: any;
  apellido: any;
  pass: any;

  usuarios = [];
  registros: any;
  flagLogin: any;

  loading: any;

  //Datos del storage
  _TOKEN: any = "tokenData";
  TOKEN: any;
  public API_URL: string;
  public headers;
  public keyIdentificacion: string = 'identiData';


  constructor(
    public navCtrl: NavController,
    public myToastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    private storage: Storage,
    public apiServices: ApiServicesProvider,
    public databaseprovider: DatabaseProvider,
    public http: Http
  ) {

    this.API_URL = GLOBAL.url;
    this.headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });

    /**
     * Verifica si el token exite. Si existe inicia la app lo redirecciona a PlazasPage
     * De lo contrario lo lleva al inicio de sesión - HomePage
     */
    this.storage.get(this._TOKEN).then((val) => {
      this.TOKEN = val;
      //console.log('TOKEN STORAGE', this.TOKEN);


    });

    // if (this.TOKEN != null) {
    //   this.navCtrl.setRoot(HomePage);
    // } else {
    //   this.navCtrl.setRoot(PlazasPage);
    // }

  }



  /**
   * 
   * @param mensaje recibe el mensaje que se mostrará en el loadingController
   */
  setOcupado(mensaje: string = 'cargando') {
    this.loading = this.loadingCtrl.create({
      content: mensaje
    });

    this.loading.present();

  }

  setDesocupado() {
    try {
      this.loading.dismiss().catch(()=>console.error("home"));
    } catch (error) {
      
    }
  }


  /**
   * Verifica si la tabla usuarios existe en la bd local
   */
  registrosNum() {
    this.databaseprovider.numeroregistrosUsuarios().then(data => {
      this.registros = data;
      console.log("REGISTRO!: ", this.registros);
    })


  }

  /**
   * Valida los datos de entrada en el Inicio de sesión
   * de ser correcta la identificación y la contraseña iniciada
   * lo direccionará al menu de plazas
   */
  iniciarSesion() {

    this.databaseprovider.numeroregistrosUsuarios().then(data => {
      this.registros = data;
      console.log("REGISTRO!: ", this.registros);

      if (this.registros > 0) {
        console.log("SIN CONEXIÓN");

        this.buscarUsuario();


      } else {
        console.log("CONEXIÓN API");

        let login = {
          contrasenia: this.contrasenia,
          identificacion: this.identificacion
        }

        this.apiServices.login(login)
          .then(res => {
            this.TOKEN = res;
            this.storage.set(this._TOKEN, res);

            //console.log("TOKEN: " + this._TOKEN);

            if (res.status != 'error') {
              let loading = this.loadingCtrl.create({
                content: 'Iniciando Sesión...'
              });

              loading.present();

              setTimeout(() => {
                this.buscarUsuario();
                this.navCtrl.setRoot(PlazasPage);
                loading.dismiss();
              }, 1500);
            } else {
              let toast = this.myToastCtrl.create({
                message: 'La identificación o la contraseña ingresada son incorrectas',
                duration: 3000,
                position: 'top'
              });

              toast.onDidDismiss(() => {
                console.log('toast Dismissed');
              });

              toast.present();
            }

          })
          .catch(error => {
            console.error("Error al iniciar: ", error.message);
          })

      }
    })

    //Guarda datos del recaudador en el storange
    this.storage.set(this.keyIdentificacion, this.identificacion);
    console.log("Identificación Storange: " + this.identificacion);

  }

  buscarUsuario() {
    console.log("buscar: ", this.identificacion);
    this.databaseprovider.getUsuarioId(this.identificacion).then(
      (data) => {
        this.usuarios = data;

        for (let i = 0; i < this.usuarios.length; i++) {
          this.nombreusuario = this.usuarios[i].nombreusuario;
          this.apellido = this.usuarios[i].apellido;
          this.pass = this.usuarios[i].contrasenia;
        }
        this.recaudador = this.nombreusuario + ' ' + this.apellido;
        this.storage.set(this.keyRecaudador, this.recaudador);
        console.log('PASSWORD: ', this.pass);

        if (this.comprarPassword(this.contrasenia, this.pass)) {
          console.log("Son Iguales");

          let loading = this.loadingCtrl.create({
            content: 'Iniciando Sesión...'
          });

          loading.present();

          setTimeout(() => {
            this.navCtrl.setRoot(PlazasPage);
            loading.dismiss();
          }, 1500);

        } else {
          console.log("No son iguales");
          let toast = this.myToastCtrl.create({
            message: 'La identificación o la contraseña ingresada son incorrectas',
            duration: 3000,
            position: 'top'
          });

          toast.onDidDismiss(() => {
            console.log('toast Dismissed');
          });

          toast.present();
        }

      })

  }


  private comprarPassword(passTexto: string, passEncriptada: string): boolean {
    let shaObj = new jsSHA("SHA-256", "TEXT");
    console.log("Qué es = ", passTexto);

    shaObj.update(passTexto);
    let hash:string = shaObj.getHash("HEX");
    hash=hash.trim();
    console.error("pass encriptada", passEncriptada);
    
    //console.log("trim", passEncriptada.trim());
    
    //3passEncriptada=passEncriptada.trim();
    

    try {
      return hash== passEncriptada;
    } catch (error) {
      return true;
    }
    

  }




}
