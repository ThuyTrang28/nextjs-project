<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Config extends Model
{
    use HasFactory;
    
    public $table = 'config'; 
    public $timestamps = false; 
    
    public $fillable = [
        'site_name', 'logo', 'hotline', 'email', 'address', 'facebook', 'youtube'
    ]; 
}