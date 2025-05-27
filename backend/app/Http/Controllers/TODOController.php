<?php

namespace App\Http\Controllers;

use App\Models\TODO;
use Illuminate\Http\Request;

class TODOController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Retrieve all to-do items and return as JSON response
        $todos = TODO::all();
        return response()->json($todos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Validate the request data
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'is_completed' => 'boolean',
        ]);

        // Create a new to-do item
        $todo = TODO::create([
            'title' => $request->title,
            'description' => $request->description,
            'is_completed' => $request->is_completed ?? false,
        ]);

        return response()->json($todo, 201); // Return 201 Created response
    }

    /**
     * Display the specified resource.
     */
    public function show(TODO $tODO)
    {
        // Return the specified to-do item as JSON response
        return response()->json($tODO);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, TODO $tODO)
    {
        // Validate the request data
        $request->validate([
            'title' => 'string|max:255',
            'description' => 'nullable|string',
            'is_completed' => 'boolean',
        ]);

        // Update the to-do item
        $tODO->update($request->only(['title', 'description', 'is_completed']));

        return response()->json($tODO, 201);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(TODO $tODO)
    {
        // Delete the to-do item
        $tODO->delete();

        return response()->json(['message' => 'To-Do item deleted successfully']);
    }
}
