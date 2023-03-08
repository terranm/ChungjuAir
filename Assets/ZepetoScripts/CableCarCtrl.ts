import { GameObject, Transform, WaitForSeconds } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import CableCarMove from './CableCarMove';

export default class CableCarCtrl extends ZepetoScriptBehaviour {

    public Points : Transform[] = new Array();
    public Cars : Transform[] = new Array();
    public StartNum : number[];

    public WaitTime : number = 3;
    public Speed : number = 5;

    Start() {    
        this.Points = this.transform.GetChild(0).GetComponentsInChildren<Transform>();
        this.Cars = this.transform.GetChild(1).GetComponentsInChildren<Transform>();

        this.Points.shift();
        this.Cars.shift();
        this.StartNum = new Array(1,2,2,3,3,4);

        for(let i = 0; i < this.Cars.length; i++){ 
             this.Cars.splice(i+1,2)
        }

        this.Cars.forEach(carTr => {
            let carMove = carTr.GetComponent<CableCarMove>()
            carMove._points = this.Points;
            carMove._speed = this.Speed;
            carTr.gameObject.SetActive(false);
        });
        
        this.StartCoroutine(this.CarsStarter());    
    }

    private *CarsStarter(){
        let i = 0;
        while(true){
            this.Cars[i++].gameObject.SetActive(true);
            i == this.Cars.length ? i = 0 : i;
            yield new WaitForSeconds(this.WaitTime);
        }
    }
}