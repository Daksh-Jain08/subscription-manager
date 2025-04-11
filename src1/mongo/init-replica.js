// init-replica.js
db = db.getSiblingDB("admin");

try {
	const status = rs.status();
	if (status.ok === null || status.ok === 0 || status.code === 94) {
		print("Replica set not initialized. Initializing...");
		rs.initiate({
			_id: "rs0",
			members: [{ _id: 0, host: "mongo:27017" }],
		});
	} else {
		print("Replica set already initialized.");
	}
} catch (err) {
	print("Error checking replica set status:", err.message);
}
