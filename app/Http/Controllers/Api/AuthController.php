<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\Usuarios;

class AuthController extends Controller
{
    //Se crea la funcion del login

    public function login(Request $request){

        $data = $request->validate([
            'user' => 'required|string',
            'password' => 'required|string'
        ]);
        
        $user = Usuarios::where('usuario', $data['usuario'])->first();

        if(! $user || !Hash:: check($data['password'],
        $user->password)){
            throw ValidationException::withMessages([
                'user' => ['Credenciales incorrectas.'],]);
        }
    }
}
