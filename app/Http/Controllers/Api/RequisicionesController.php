<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SolicitudCompra;

class RequisicionesController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return SolicitudCompra::with('usuario')->orderBy('id_solicitud', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'folio' => 'required|string|max:20',
            'fecha' => 'nullable|date',
            'motivo' => 'required|string|max:255',
            'estado' => 'nullable|string|max:50',
            'id_usuario' => 'required|exists:usuarios,id_usuario'
        ]);

        if(empty($data['estado'])) {
            $data['estado'] = 'Borrador';
        }

        $requisicion = SolicitudCompra::create($data);
        return response()->json($requisicion->load('usuario'), 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $requisicion = SolicitudCompra::with('usuario')->findOrFail($id);
        return response()->json($requisicion);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $requisicion = SolicitudCompra::findOrFail($id);
        
        $data = $request->validate([
            'folio' => 'sometimes|required|string|max:20',
            'fecha' => 'nullable|date',
            'motivo' => 'sometimes|required|string|max:255',
            'estado' => 'nullable|string|max:50',
            'id_usuario' => 'sometimes|required|exists:usuarios,id_usuario'
        ]);

        $requisicion->update($data);
        return response()->json($requisicion->load('usuario'));
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $requisicion = SolicitudCompra::findOrFail($id);
        $requisicion->delete();
        return response()->noContent();
    }
}
