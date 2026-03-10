import sqlite3

conn = sqlite3.connect('inboxai.db')
cursor = conn.cursor()
cursor.execute('SELECT id, name, email, phone FROM users')
users = cursor.fetchall()
print('Registered users:')
for u in users:
    print(f'  ID: {u[0]}, Name: {u[1]}, Email: {u[2]}, Phone: {u[3]}')
    
if len(users) == 0:
    print('  (No users registered yet)')
conn.close()
