package course_project.controller;

import course_project.util.ActiveUserManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/rest")
public class WebSocketConnectionRestController {

    @Autowired
    private ActiveUserManager activeUserManager;

    @PostMapping("/user-connect")
    public ResponseEntity<String> userConnect(@RequestParam("username") String userName) {
        activeUserManager.add(userName);
        return ResponseEntity.ok("connected");
    }

    @PostMapping("/user-disconnect")
    public ResponseEntity<String> userDisconnect(@RequestParam("username") String userName) {
        activeUserManager.remove(userName);
        return ResponseEntity.ok("disconnected");
    }

    @GetMapping("/active-users-except/{userName}")
    public ResponseEntity<?> getActiveUsersExceptCurrentUser(@PathVariable String userName) {
        return ResponseEntity.ok(activeUserManager.getActiveUsersExceptCurrentUser(userName));
    }
}
