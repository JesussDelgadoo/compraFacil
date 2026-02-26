<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\Usuarios;

class AuthController extends Controller
{
    public function login(Request $request){

        $data = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);
        
        $user = Usuarios::where('email', $data['email'])->first();

        if(! $user || !Hash::check($data['password'], $user->password)){
            throw ValidationException::withMessages([
                'email' => ['Credenciales incorrectas.'],
            ]);
        }

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'token' => $token,
            'usuario' => [
                'id_usuario' => $user->id_usuario,
                'nombre_completo' => $user->nombre_completo,
                'email' => $user->email,
                'rol' => $user->rol?->nombre_rol, 
                'departamento' => $user->departamento?->nombre_departamento,
                'empleado' => $user->empleado ? [
                    'numero_empleado' => $user->empleado->numero_empleado,
                    'puesto_especifico' => $user->empleado->puesto_especifico,
                ] : null,
            ]
        ]);
    }

    public function me(Request $request){
        $user = $request->user();
        $user->load(['rol', 'departamento', 'empleado']);
        return response()->json($user);
    }

    public function logout(Request $request){
        $request->user()->currentAccessToken()->delete();
        return response()->noContent();
    }
}