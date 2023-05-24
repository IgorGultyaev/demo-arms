package ru.croc.ctp.demo;

import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import ru.croc.ctp.demo.domain.Employee;
import ru.croc.ctp.demo.domain.QEmployee;
import ru.croc.ctp.jxfw.core.store.events.DomainObjectStoreEvent;
import ru.croc.ctp.jxfw.jpa.load.events.JpaBeforeLoadEvent;
// переписать руками
@Component
public class SoftDeleteEmployeeEventListeners {
    @EventListener(condition = "#event.domainObject.removed")
    public void beforeRemoveEmployee(DomainObjectStoreEvent<Employee> event) {
        event.getDomainObject().setRemoved(false);
        event.getDomainObject().setFired(true);

    }

    @EventListener
    public void beforelLoadEmployee(JpaBeforeLoadEvent<Employee> event) {
        QEmployee employee = QEmployee.employee;
        event.getPredicate().and(employee.fired.eq(false));
    }
}

