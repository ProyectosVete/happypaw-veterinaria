import sqlite3
import re

print("📁 Exportando SOLO tus tablas personalizadas...")

conn = sqlite3.connect('db.sqlite3')
cursor = conn.cursor()

# SOLO tus tablas (excluyendo las de Django)
mis_tablas = ['clients', 'pets', 'veterinarians', 'appointments', 'medical_records']

sql_lines = []
sql_lines.append("-- Base de datos Sistema Veterinario")
sql_lines.append("CREATE DATABASE IF NOT EXISTS veterinaria_db;")
sql_lines.append("USE veterinaria_db;")
sql_lines.append("SET FOREIGN_KEY_CHECKS=0;")
sql_lines.append("")

for table_name in mis_tablas:
    print(f"📋 Procesando: {table_name}")
    
    try:
        # Verificar si la tabla existe
        cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table_name}';")
        if not cursor.fetchone():
            print(f"  ⚠️ Tabla {table_name} no existe")
            continue
        
        # Obtener CREATE TABLE
        cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';")
        create_sql = cursor.fetchone()[0]
        
        # Limpiar y convertir a MySQL
        create_sql = create_sql.replace('"', '`')
        create_sql = create_sql.replace('AUTOINCREMENT', 'AUTO_INCREMENT')
        create_sql = create_sql.replace('integer PRIMARY KEY AUTO_INCREMENT', 'int PRIMARY KEY AUTO_INCREMENT')
        create_sql = create_sql.replace('text', 'varchar(255)')
        create_sql = create_sql.replace('datetime', 'datetime')
        
        # Eliminar restricciones problemáticas
        create_sql = re.sub(r',\s*FOREIGN KEY\s*\([^)]+\)\s*REFERENCES\s*[^)]+', '', create_sql)
        
        sql_lines.append(f"DROP TABLE IF EXISTS `{table_name}`;")
        sql_lines.append(f"{create_sql};")
        sql_lines.append("")
        
        # Obtener datos
        cursor.execute(f"SELECT * FROM {table_name}")
        rows = cursor.fetchall()
        
        if rows:
            cursor.execute(f"PRAGMA table_info({table_name})")
            columns = [col[1] for col in cursor.fetchall()]
            
            for row in rows:
                values = []
                for val in row:
                    if val is None:
                        values.append('NULL')
                    elif isinstance(val, str):
                        val = val.replace("'", "''")
                        values.append(f"'{val}'")
                    elif isinstance(val, (int, float)):
                        values.append(str(val))
                    else:
                        values.append(f"'{str(val)}'")
                
                sql_lines.append(f"INSERT INTO `{table_name}` (`{'`, `'.join(columns)}`) VALUES ({', '.join(values)});")
            sql_lines.append("")
            
    except Exception as e:
        print(f"  ❌ Error en {table_name}: {e}")

sql_lines.append("SET FOREIGN_KEY_CHECKS=1;")

with open('solo_mis_tablas.sql', 'w', encoding='utf-8') as f:
    f.write('\n'.join(sql_lines))

print(f"\n✅ Exportación completada: solo_mis_tablas.sql")
conn.close()