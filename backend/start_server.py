# start_server.py
import os
import sys
import subprocess
import time
import webbrowser

def main():
    # Obtener la ruta del directorio actual
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    print("Iniciando servidor HAPPYPAW...")
    
    # Iniciar Django
    django_cmd = f'python "{os.path.join(base_dir, "manage.py")}" runserver 8000'
    
    # Abrir navegador después de 3 segundos
    time.sleep(3)
    webbrowser.open('http://localhost:8000')
    
    # Ejecutar Django
    subprocess.run(django_cmd, shell=True)

if __name__ == '__main__':
    main()