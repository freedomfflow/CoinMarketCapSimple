import "../RemixStuff/Ownable.sol";
import "./People.sol";

pragma solidity 0.5.12;

contract Workers is Ownable, People {

    // No need for a struct??  Worker is a person with a salary mapping to the same address??
    struct Worker {
        //address workerId;       // does this make sense?
    }

    event workerFired(string name);

    mapping (address => uint) private salary;

    function createWorker(string memory name, uint age, uint height, uint wage) private {
        require(age <= 75, "Celebrate!  It's time for you to retire");

        createPerson(name, age, height);
        salary[msg.sender] = wage;
    }

    // Can I just assume if a salary exists, the person is a worker, and if no salary, not a worker
    // So no worker struct in this case??
    function fireWorker(address creator) public onlyOwner {
        string memory name = people[creator].name;
        delete salary[creator];

        emit workerFired(name);
    }
}
