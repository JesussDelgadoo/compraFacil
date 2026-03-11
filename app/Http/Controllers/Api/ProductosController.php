<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Productos;
use Illuminate\Http\Request;

class ProductosController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Productos::orderBy('id_producto', 'desc')->get();
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'sku' => 'required|string|max:50',
            'nombre' => 'required|string|max:150',
            'descripcion' => 'nullable|string|max:255',
            'unidad_medida' => 'required|string|max:50',
            'precio_referencia' => 'nullable|numeric|min:0'
        ]);

        $producto = Productos::create($data);
        return response()->json($producto, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $producto = Productos::findOrFail($id);
        return response()->json($producto);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        $producto = Productos::findOrFail($id);
        
        $data = $request->validate([
            'sku' => 'sometimes|required|string|max:50',
            'nombre' => 'sometimes|required|string|max:150',
            'descripcion' => 'nullable|string|max:255',
            'unidad_medida' => 'sometimes|required|string|max:50',
            'precio_referencia' => 'nullable|numeric|min:0'
        ]);

        $producto->update($data);
        return response()->json($producto);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        $producto = Productos::findOrFail($id);
        $producto->delete();
        return response()->noContent();
    }
}
