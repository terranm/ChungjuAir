import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import {Mathf, Quaternion, Vector3, Vector2, Time, Input} from 'UnityEngine'
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';

export default class CameraClamp extends ZepetoScriptBehaviour {

    public speed: number;
    public isInit: boolean;

    private min : number;
    private max : number;


    public Init(min, max, speed)
    {
        this.min = min;
        this.max = max;
        this.speed = speed;
        
        this.isInit = true;
    }

    LateUpdate() {

        if (this.isInit) {

            var angleX = this.ClampAngle(this.transform.eulerAngles.x, this.min, this.max);
            
            
            //this.transform.rotation = Quaternion.Euler(new Vector3(this.transform.eulerAngles.x, angleY, this.transform.eulerAngles.z));
            
            var a = this.transform.rotation;
            var b = Quaternion.Euler(new Vector3(angleX, this.transform.eulerAngles.y, this.transform.eulerAngles.z));
            this.transform.rotation = Quaternion.Lerp(a, b, Time.deltaTime * this.speed);
        }

    }

    ClampAngle(current, min, max) {
        var dtAngle = Mathf.Abs(((min - max) + 180) % 360 - 180);
        var hdtAngle = dtAngle * 0.5;
        var midAngle = min + hdtAngle;

        var offset = Mathf.Abs(Mathf.DeltaAngle(current, midAngle)) - hdtAngle;
        if (offset > 0)
            current = Mathf.MoveTowardsAngle(current, midAngle, offset);
        return current;
    }

}