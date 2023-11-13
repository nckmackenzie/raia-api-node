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
    ('{"id": "' || u.id || '", "fullName": "' || u.full_name || '", "avatar": "' || u.profile_image || '"}')::JSON AS assignedLeader
  FROM tickets t
  LEFT JOIN users u ON t.assigned_leader_id = u.id
  `;
  return sql;
};
