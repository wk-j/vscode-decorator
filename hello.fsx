open System.Linq
open System
open System.Threading
open System.Timers

let x = [100;200;300]

[1;2;3].Select(fun i -> i + 1) 

type Record = {
    X: int
    Y: int
}

type Hello = {
    X: int
}

let k = (1,2,3,3)