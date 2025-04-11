// init-replica.js
db = db.getSiblingDB("admin");

try {
	const status = rs.status();
	if (status.ok === 0 || status.code === 94) {
		rs.initiate({
			_id: "rs0",
			members: [{ _id: 0, host: "localhost:27017" }],
		});
	}
} catch (err) {
	print("Error checking replica set status:", err.message);
}

