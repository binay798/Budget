
//BUDGET CONTROLLER
let budgetController = (function(){
    let Expense = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    }
    Expense.prototype.calcPercentage = function(totalIncome) {
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome)*100);
        }else{
            this.percentage = -1;
        }
        
    }
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    }




    let Income = function(id,description,value){
        this.id = id;
        this.description = description;
        this.value = value;
    }
    let calculateTotal = function(type){
        let sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value;
        })
        data.totals[type] = sum;
    }
    let data = {
        allItems:{
            exp:[],
            inc:[],
        },
        totals:{
            exp:0,
            inc:0,
        },
        budget:0,
        percentage:-1,
    }
    return {
        addItem:function(type,des,value){
            let newItem,ID;
            //create new id
            if(data.allItems[type].length > 0){
                ID=data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else{
                ID = 0;
            }
            
            //create new item based on 'exp' or 'inc'
            if(type === 'exp'){
                newItem = new Expense(ID,des,value);
            }else if(type === 'inc'){
                newItem = new Income(ID,des,value);
            }
            //push data to datastructure
            data.allItems[type].push(newItem);
            //return new item
            return newItem;
        },
        deleteItem:function(type,id) {
            let ids,index;

            ids = data.allItems[type].map(function(current){
                return current.id;
            })
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
            
        },


        calculateBudget:function(){
            //CALCULATE TOTAL INCOME AND EXPENSES
            calculateTotal('exp');
            calculateTotal('inc');
            //CALCULATE BUDGET INCOME - EXPENSES
            data.budget = data.totals['inc'] - data.totals['exp'];
            //CALCULATE THE % OF INCOMES THAT WE SPENT
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else{
                data.percentage = -1;
            }
        },
        calculatePercentage:function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            })

        },
        getPercentages:function(){
            let allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            })
            return allPerc;
        },
        getBudget:function() {
            return {
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage,
            }
        },
        testing:function(){
            console.log(data);
        }
    }
})();


//UI CONTROLLER
let UIController = (function(){
    let nodeListForEach;
    let DOMstrings = {
        inputType:".add__type",
        inputDescription:".add__description",
        inputValue:".add__value",
        inputBtn:".add__btn",
        incomeContainer:".income__list",
        expenseContainer:".expenses__list",
        budgetLabel:".budget__value",
        incomeLabel:".budget__income--value",
        expenseLabel:".budget__expenses--value",
        percentageLabel:".budget__expenses--percentage",
        container:".container",
        expensesPercLabel:".item__percentage",
        dateLabel:'.budget__title--month',
    }
    let formatNumbers = function(num,type){
        let numSplit,integer,decimal,sign;
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split(".");
        integer = numSplit[0];
        if(integer.length > 3) {
            integer = integer.substr(0,integer.length - 3) + "," +integer.substr(integer.length - 3,3);
        }
        decimal = numSplit[1];

        
        return (type === 'exp'?'-':'+') +" "+integer+"."+decimal;
    }
    nodeListForEach = function(list,callback){
        for(let i=0;i<list.length;i++){
            callback(list[i],i);
        }
    };
    return {
        getInput:function(){

            return {
                type : document.querySelector(DOMstrings.inputType).value,    //either inc or exp
                description : document.querySelector(DOMstrings.inputDescription).value,
                value : parseFloat(document.querySelector(DOMstrings.inputValue).value),
            }
            
        },
        addListItem:function(obj,type){
            let html,newHtml;
            //Create html string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if(type === 'exp'){
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            //Replace palceholder with data
            newHtml = html.replace("%id%",obj.id);
            newHtml = newHtml.replace("%description%",obj.description);
            newHtml = newHtml.replace("%value%",formatNumbers(obj.value,type));
            //Insert into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);

        },
        deleteListItem:function(selectorId) {
            let el = document.getElementById(selectorId);
            el.parentNode.removeChild(el);
        },
        getDOMstrings:function(){
            return DOMstrings;
        },
        clearFields:function() {
            let fields,fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription+","+DOMstrings.inputValue)
            
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function(current,index){
                current.value = "";
            })
            fieldsArr[0].focus();
            
        },
        displayBudget:function(obj) {
            let type;
            obj.budget > 0 ?type="inc":type="exp";

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumbers(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumbers(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent =formatNumbers( obj.totalExp,'exp');

            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + "%";
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = "---";
            }
            
        },
        displayPercentages:function(percentages){
            let fields;
            fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
            
            
            nodeListForEach(fields,function(current,index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + "%";
                }else{
                    current.textContent ="---";
                }
                
            })
            
        },
        displayMonth:function() {
            let now ,year,month;
            now = new Date();
            month = now.getMonth();
            mnth = ['Jan','Feb','March','April','May','June','July','August','September','October','November','December']
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = mnth[month] + ","+year;
        },
        changedType:function() {
            let fields = document.querySelectorAll(
                DOMstrings.inputType +','+DOMstrings.inputDescription +','+DOMstrings.inputValue
            )

            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            })
            document.querySelector(DOMstrings.inputBtn).classList.toggle("red");
        }
        
    }
})();


//GLOBAL APP CONTROLLER
let controller = (function(budgetCtrl,UICtrl){

    let setupEventListeners = function(){
        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener("click",ctrlAddItem);

        document.addEventListener("keypress",function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        })
        document.querySelector(DOM.container).addEventListener("click",ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener("change",UICtrl.changedType)
    }
    let ctrlDeleteItem = function(event){
        let itemId,splitId,type,ID;
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if(itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            ID = splitId[1];
            ID = parseInt(ID);
            //DELETE ITEM FROM DATA STRUCTURE
            budgetCtrl.deleteItem(type,ID);
            //DELET FROM UI 
            UICtrl.deleteListItem(itemId);
            //DELETE ITEM FROM BUDGET
            updateBudget();
            //CALCULATE AND UPDATE PERCENTAGES
            updatePercentages();
        }


    };
    let updateBudget = function() {
        //Calculate the budget
        budgetCtrl.calculateBudget();
        //Return the budget
        let budget = budgetCtrl.getBudget();
        //Display the budget in the UI
        UICtrl.displayBudget(budget);

    }

    let ctrlAddItem = function(){
        let input,newItem;
         // GET INPUT DATA
        input = UICtrl.getInput();
            
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //ADD ITEM TO BUDGET CONTROLLER
            newItem = budgetCtrl.addItem(input.type,input.description,input.value);
            //ADD ITEM TO UI 
            UICtrl.addListItem(newItem,input.type);

            //CLEAR FIELDS
            UICtrl.clearFields();
            //UPDATE AND DISPLAY BUDGET
            updateBudget();
            //CALCULATE AND UPDATE PERCENTAGES
            updatePercentages();
        }
        
    }
    let updatePercentages = function(){
        //CALCULATE PERCENTAGES
        budgetCtrl.calculatePercentage();

        //get percentages
        let percentages = budgetCtrl.getPercentages();

        //DISPLAY PERCENTAGES

        UICtrl.displayPercentages(percentages);
        
    }
    
    return {
        init:function(){
            console.log("worked");
            UICtrl.displayBudget(
                {
                    budget:0,
                    totalInc:0,
                    totalExp:0,
                    percentage:-1,
                }

            );
            setupEventListeners();
            UICtrl.displayMonth();
        }
    }
    array
})(budgetController,UIController);

controller.init();