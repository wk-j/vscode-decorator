open System.Linq
open System
open System.Threading
open System.Timers

type A = {
    X: int
    Y: int
}

let z = [1;2;3;4]
z |> List.map ((+) 1) |> printfn "%A"