package course_project.util;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Set;
import java.util.concurrent.*;
import java.util.stream.Collectors;

import static java.util.function.Predicate.not;

@Component
public class ActiveUserManager {

    private final Set<String> set;

    private final List<ActiveUserChangeListener> listeners;

    private final ThreadPoolExecutor notifyPool;

    private ActiveUserManager() {
        set = ConcurrentHashMap.newKeySet();
        listeners = new CopyOnWriteArrayList<>();
        notifyPool = new ThreadPoolExecutor(1, 5, 10, TimeUnit.SECONDS, new ArrayBlockingQueue<>(100));
    }

    public void add(String userName) {
        set.add(userName);
        notifyListeners();
    }

    public void remove(String userName) {
        set.remove(userName);
        notifyListeners();
    }

    public Set<String> getAll() {
        return set;
    }

    public Set<String> getActiveUsersExceptCurrentUser(String userName) {
        return set.stream().filter(not(userName::equals)).collect(Collectors.toSet());
    }

    public void registerListener(ActiveUserChangeListener listener) {
        listeners.add(listener);
    }

    public void removeListener(ActiveUserChangeListener listener) {
        listeners.remove(listener);
    }

    private void notifyListeners() {
        notifyPool.submit(() -> listeners.forEach(ActiveUserChangeListener::notifyActiveUserChange));
    }
}
