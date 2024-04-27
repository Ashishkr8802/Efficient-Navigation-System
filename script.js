$(document).ready(function() {
    $('#routeForm').submit(function(event) {
        event.preventDefault();

        // Get input values
        const startLocation = $('#startLocation').val();
        const destination = $('#destination').val();
        const vehicleWidth = parseFloat($('#vehicleWidth').val());
        const vehicleHeight = parseFloat($('#vehicleHeight').val());

        if (startLocation.trim().toLowerCase() === destination.trim().toLowerCase()) {
            // Display alert if starting location and destination are the same
            $('#result').html(`<div class="alert alert-danger" role="alert">
                Starting location and destination cannot be the same.
            </div>`);
            // Clear existing graph
            clearGraph();
            return; // Stop further execution
        }

        if (startLocation.trim().toLowerCase() !== 'pari chowk' || destination.trim().toLowerCase() !== 'galgotias university') {
            // Display alert if input values are not valid
            $('#result').html(`<div class="alert alert-danger" role="alert">
                Entered Data is not valid.
            </div>`);
            // Clear existing graph
            clearGraph();
            return; // Stop further execution
        }

        // Available paths
        const routes = [
            [{ width: 3, height: 3 }, { width: 2, height: 4 }, { width: 5, height: 2 }],
            [{ width: 4, height: 4 }, { width: 3, height: 3 }, { width: 6, height: 3 }],
            [{ width: 2, height: 2 }, { width: 4, height: 5 }, { width: 3, height: 3 }]
        ];

        // Calculate routes, valid paths, and shortest distance
        const { validPaths, shortestDistance } = calculateRoutes(routes, vehicleWidth, vehicleHeight);

        // Clear existing graph
        clearGraph();

        // Display graph and result
        displayGraph(routes, validPaths, shortestDistance);
    });

    // Function to calculate routes
    function calculateRoutes(routes, vehicleWidth, vehicleHeight) {
        let validPaths = [];
        let shortestDistance = Infinity;

        // Iterate through each path
        routes.forEach((path, index) => {
            // Check if the vehicle can pass through this path
            let canPassPath = true;
            let totalWidth = 0;
            let totalHeight = 0;

            // Calculate total width and height of the path
            path.forEach(segment => {
                totalWidth += segment.width;
                totalHeight += segment.height;
            });

            // Compare total path dimensions with vehicle dimensions
            if (totalWidth < vehicleWidth || totalHeight < vehicleHeight) {
                canPassPath = false;
            }

            // If the vehicle can pass through this path, check if it's the shortest one
            if (canPassPath) {
                const pathDistance = Math.sqrt(totalWidth ** 2 + totalHeight ** 2); // Euclidean distance
                if (pathDistance < shortestDistance) {
                    shortestDistance = pathDistance;
                    validPaths = [index];
                } else if (pathDistance === shortestDistance) {
                    validPaths.push(index);
                }
            }
        });

        // Return the valid paths and the shortest distance
        return { validPaths, shortestDistance };
    }

    // Function to clear existing graph
    function clearGraph() {
        const canvas = document.getElementById('myChart');
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    // Function to display graph
    function displayGraph(routes, validPaths, shortestDistance) {
        const chartData = {
            labels: Array.from({ length: routes.length }, (_, i) => `Path ${i + 1}`),
            datasets: [{
                label: 'Path Dimensions',
                backgroundColor: ['#007bff', '#28a745', '#ffc107'],
                borderColor: 'rgba(0, 0, 0, 0.1)',
                borderWidth: 1,
                data: routes.map(path => path.reduce((acc, segment) => acc + segment.width * segment.height, 0)),
            }]
        };

        const ctx = document.getElementById('myChart').getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            callback: function(value) {
                                return value + ' sq. meters';
                            }
                        }
                    }]
                },
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Path Dimensions and Distance'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(tooltipItem, data) {
                            const pathIndex = tooltipItem.datasetIndex;
                            const pathData = routes[pathIndex];
                            const pathDimensions = pathData.map(segment => `${segment.width}m x ${segment.height}m`).join(', ');
                            const distance = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                            return `Dimensions: ${pathDimensions} | Distance: ${distance.toFixed(2)} meters`;
                        }
                    }
                }
            }
        });

        // Display valid paths and shortest distance
        const $result = $('#result');
        if (validPaths.length > 0) {
            $result.append(`<div class="alert alert-success mt-3" role="alert">
                Shortest distance for emergency vehicle: ${shortestDistance.toFixed(2)} Km<br>
                Valid paths for the vehicle: ${validPaths.map(pathIndex => `Path ${pathIndex + 1}`).join(', ')}
            </div>`);
        } else {
            $result.append(`<div class="alert alert-danger mt-3" role="alert">
                No valid paths found for the vehicle.
            </div>`);
        }

        // Display distances of other paths compared to the shortest one
        const otherPathsDistances = routes.map((path, index) => {
            if (!validPaths.includes(index)) {
                const totalWidth = path.reduce((acc, segment) => acc + segment.width, 0);
                const totalHeight = path.reduce((acc, segment) => acc + segment.height, 0);
                const pathDistance = Math.sqrt(totalWidth ** 2 + totalHeight ** 2);
                return { pathIndex: index, distance: pathDistance };
            }
        }).filter(Boolean);

        if (otherPathsDistances.length > 0) {
            $result.append(`<div class="alert alert-info mt-3" role="alert">
                Distances of other paths compared to the shortest one:<br>
                ${otherPathsDistances.map(({ pathIndex, distance }) => `Path ${pathIndex + 1}: ${distance.toFixed(2)} Km`).join('<br>')}
            </div>`);
        }
    }
});
