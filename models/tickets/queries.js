exports.getTickets = () => {
  const sql = `
  SELECT 
  t.id,
  t.title,
  t.ticket_no,
  t.user_id,
  t.category,
  t.priority,
  t.status,
  t.created_at,
  ('{"id": "' || u.id || '", "fullName": "' || u.full_name || '", "username": "' || u.username || '", "avatar": "' || u.profile_image || '"}')::JSON AS creator,
  ('{"id": "' || l.id || '", "fullName": "' || l.full_name || '", "username": "' || l.username || '","avatar": "' || l.profile_image || '"}')::JSON AS assignedLeader
FROM tickets t 

join users u on t.user_id = u.id
LEFT JOIN users l ON t.assigned_leader_id = l.id
  `;
  return sql;
};

exports.getTicket = () => {
  const sql = `
    SELECT 
    t.id,
    t.title,
    t.description,
    t.ticket_no,
    t.user_id,
    t.assigned_leader_id,
    t.category,
    t.priority,
    t.status,
    t.created_at,
    ('{"id": "' || u.id || '", "fullName": "' || u.full_name || '", "username": "' || u.username || '", "avatar": "' || u.profile_image || '"}')::JSON AS creator,
    ('{"id": "' || l.id || '", "fullName": "' || l.full_name || '", "username": "' || l.username || '","avatar": "' || l.profile_image || '"}')::JSON AS assignedLeader
  FROM tickets t 
  
  join users u on t.user_id = u.id
  LEFT JOIN users l ON t.assigned_leader_id = l.id
  WHERE t.id = ?
    `;
  return sql;
};
