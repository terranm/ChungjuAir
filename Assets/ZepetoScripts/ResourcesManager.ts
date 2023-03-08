import { GameObject, Object, Resources, Transform } from 'UnityEngine'

export default class ResourcesManager{

    public Load<T extends Object>(path:string) :T{
        return Resources.Load<T>(path);
    }

    public Instantiate(path:string, parent:Transform = null):GameObject{
        let prefab = this.Load<GameObject>(`Prefabs/${path}`);

        if(prefab == null){
            console.log(`Failed to load prefab ${path}`);
            return null;
        }

        return Object.Instantiate(prefab, parent) as GameObject;
    }

    public Destroy(go:GameObject){
        if(go == null)
            return null;

        Object.Destroy(go);
    }
}