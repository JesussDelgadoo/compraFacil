<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Empleados;

class EmpleadosController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Empleados::with('usuario')->orderBy('id_empleado', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'id_usuario' => 'required|exists:usuarios,id_usuario|unique:empleados,id_usuario',
            'numero_empleado' => 'nullable|string|max:20',
            'fecha_contratacion' => 'nullable|date',
            'puesto_especifico' => 'nullable|string|max:100'
        ]);

        $empleado = Empleados::create($data);
        return response()->json($empleado->load('usuario'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $empleado = Empleados::with('usuario')->findOrFail($id);
        return response()->json($empleado);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $empleado = Empleados::findOrFail($id);
        
        $data = $request->validate([
            'id_usuario' => 'sometimes|required|exists:usuarios,id_usuario|unique:empleados,id_usuario,'.$id.',id_empleado',
            'numero_empleado' => 'nullable|string|max:20',
            'fecha_contratacion' => 'nullable|date',
            'puesto_especifico' => 'nullable|string|max:100'
        ]);

        $empleado->update($data);
        return response()->json($empleado->load('usuario'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $empleado = Empleados::findOrFail($id);
        $empleado->delete();
        return response()->noContent();
    }
}
