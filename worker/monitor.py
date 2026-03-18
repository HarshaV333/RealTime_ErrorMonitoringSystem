from config.mysqlConnect import connection, cursor
import re
import time
import requests

# analyze the stack trace and assign a severity level
def analyze_error_trace(error_trace):
    # analyzes the messy error string to find the file and assign a severity level
    severity = "LOW"
    # Identify critical errors
    if any(word in error_trace for word in ["CONNECTION", "TIMEOUT", "DENIED", "MEMORY"]):
        severity = "CRIRICAL"
    elif "ReferenceError" in error_trace or "TypeError" in error_trace:
        severity = "MEDIUM"

    # regex to find the filename and line number in a Node.js stack trace
    # Looks for patterns like: at Object.<anonymous> (C:\project\userController.js:45:12)
    file_match = re.search(r'([\w-]+\.js:\d+)', error_trace)
    print("file match", file_match)
    file_info = file_match.group(1) if file_match else "Unknown Location"
    print("file info", file_info)

    return severity, file_info

# check for errors in database
def check_for_new_errors():
    try:
        # 1. fetch for errors that have not been analyzed at
        cursor.execute("SELECT * FROM error_logs WHERE status='new'")
        new_errors = cursor.fetchall()
        print("new errors ", new_errors)

        for error in new_errors:
            # print("error", error)
            # print(error[4])
            # 2. analyze stack trace for each error
            # error[4] bcoz in error tuple we have error_trace at 4th index
            severity, location = analyze_error_trace(error[4])
            # print(severity, location) 

            # 3. create the payload for Node.js
            analysis_results = {
                "id": error[0],
                "endpoint": error[1],
                "method": error[2],
                "severity": severity,
                "location": location,
                "message": error[3]
            }
            print(analysis_results)

            # 4. Notify Node.js with internal api call
            # try:
            #     response = requests.post('http://localhost:3000/internal/notify', json=analysis_results)
            #     if response.status_code == 200:
            #         # 5. update DB status so that we don't process it again
            #         cursor.execute("UPDATE error_logs SET status='analyzed' WHERE id=%s", error['id'])
            #         connection.commit()
            # except requests.exceptions.ConnectionError:
            #     print("Node.js server is down, Cannot Notify")

        # close the connection & cursor
        cursor.close()
        connection.close()

    except Exception as e:
        print(f"Error connecting to MySQL: {e}")


# loop to run every 10s
# while True:
#     print("Scanning for new errors")
#     check_for_new_errors()
#     time.sleep(10)

check_for_new_errors()