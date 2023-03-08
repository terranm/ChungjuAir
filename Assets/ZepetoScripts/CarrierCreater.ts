import { GameObject, LayerMask, Material, Quaternion, Renderer, Time, Vector3 } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GameManager from './GameManager';

export default class CarrierCreater extends ZepetoScriptBehaviour {
    //public carrier : GameObject;
    public mat : Material[];

    private cnt : number;
    private carrierNum : number;
    private carrierList : GameObject[];

    Start() {    
        this.cnt = 50;
        this.carrierNum = 0;
        this.carrierList = new Array<GameObject>();
        for(let i = 0; i < 10; i++){
            this.carrierList[i] = this.CreateCarrier(i.toString(), this.mat[i%5]);
        }
        this.carrierList[this.carrierList.length] = this.CreateCarrier("MyCarrier", this.mat[5]);

        // 버튼 생성
        let btn = GameManager.Resource.Instantiate("MyCarrierComponent");
        btn.transform.SetParent(this.carrierList[this.carrierList.length - 1].transform);
        btn.transform.position = this.gameObject.transform.position;
    }
    
    FixedUpdate(){
        this.cnt += Time.deltaTime;
        if(this.cnt > 3){
            if (this.carrierList[this.carrierNum].IsDestroyed()) {
                this.carrierList.splice(this.carrierNum,1);
                return;
            }
            let Obj = this.carrierList[this.carrierNum++] as GameObject;
            this.cnt = 0;
            if (this.carrierNum >= this.carrierList.length) this.carrierNum = 0;
            Obj.SetActive(true);
        }
    }

    private CreateCarrier(name : string, mat : Material){
        let Obj = GameManager.Resource.Instantiate("Carrier") as GameObject;
        Obj.name = name;
        Obj.transform.SetParent(this.gameObject.transform);
        Obj.transform.localPosition = Vector3.zero;
        Obj.transform.localRotation = Quaternion.identity;
        Obj.transform.Rotate(new Vector3(0, Time.deltaTime, 0));
        //Obj.transform.position = this.gameObject.transform.position;
        Obj.GetComponent<Renderer>().material = mat;//this.mat[i%5];
        Obj.SetActive(false);
        return Obj;
    }
    
    public CarrierDestory(carNum : string){
        let num = carNum != "MyCarrier" ? parseInt(carNum) : this.carrierList.length - 1;
        let Obj = this.carrierList[num] as GameObject;
        Obj.transform.localPosition = Vector3.zero;
        Obj.transform.localRotation = Quaternion.identity;
        Obj.SetActive(false);
    }
}