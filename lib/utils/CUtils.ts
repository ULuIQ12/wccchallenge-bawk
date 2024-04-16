export class CUtils
{
    static pcurve(x:number, a:number, b:number):number
    {
        const k:number = Math.pow(a+b,a+b)/(Math.pow(a,a)*Math.pow(b,b));
        return k*Math.pow(x,a)*Math.pow(1.0-x,b);
    }

    static gain(x:number, k:number):number
    {
        const a:number = 0.5*Math.pow(2.0*((x<0.5)?x:1.0-x), k);
        return (x<0.5)?a:1.0-a;
    }

    static almostUnitIdentity( x:number ):number
    {
        return x*x*(2.0-x);
    }
}