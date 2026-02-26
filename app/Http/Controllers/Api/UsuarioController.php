<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Usuarios;

class UsuarioController extends Controller
{
    public function index()
    {
        return Usuarios::with(['rol', 'departamento', 'empleado'])
            ->orderByDesc('id_usuario')
            ->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nombre_completo' => 'required|string|max:100',
            'email' => 'required|email|unique:usuarios,email',
            'password' => 'required|string|min:6',
            'id_rol' => 'required|exists:roles,id_rol',
            'id_departamento' => 'required|exists:departamentos,id_departamento'
        ]);

        $data['password'] = Hash::make($data['password']);

        $user = Usuarios::create($data);

        return response()->json($user->load(['rol', 'departamento', 'empleado']), 201);
    }

    public function show(Usuarios $usuario)
    {
        return $usuario->load(['rol', 'departamento', 'empleado']);
    }

    public function update(Request $request, Usuarios $usuario)
    {
        $data = $request->validate([
            'nombre_completo' => 'sometimes|required|string|max:100',
            'email' => 'sometimes|required|email|unique:usuarios,email,'.$usuario->id_usuario.',id_usuario',
            'password' => 'nullable|string|min:6',
            'id_rol' => 'sometimes|required|exists:roles,id_rol',
            'id_departamento' => 'sometimes|required|exists:departamentos,id_departamento'
        ]);

        if (isset($data['password']) && $data['password'] !== null){
            $data['password'] = Hash::make($data['password']);
        } else {
            unset($data['password']);
        }

        $usuario->update($data);

        return $usuario->fresh()->load(['rol', 'departamento', 'empleado']);
    }

    public function destroy(Usuarios $usuario)
    {
        $usuario->delete();
        return response()->noContent();
    }
}