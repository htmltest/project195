$(window).on('load', function() {
    initMap();

    async function initMap() {
        await ymaps3.ready;

        const {YMap, YMapDefaultSchemeLayer, YMapControls, YMapCollection, YMapMarker, YMapListener, YMapDefaultFeaturesLayer} = ymaps3;

        const map = new YMap(
            $('#YMapsID')[0],
            {
                location: {
                    center: [67.594635, 58.137528],
                    zoom: 4
                }
            }
        );

        map.addChild(new YMapDefaultSchemeLayer());

        ymaps3.import.registerCdn('https://cdn.jsdelivr.net/npm/{package}', ['@yandex/ymaps3-default-ui-theme@latest']);

        const {YMapZoomControl} = await ymaps3.import('@yandex/ymaps3-default-ui-theme');

        map.addChild(new YMapControls({position: 'bottom left'}).addChild(new YMapZoomControl({})));

        const defaultFeaturesLayer = new YMapDefaultFeaturesLayer();
        map.addChild(defaultFeaturesLayer);

        var dealers = [];
        var dealerCollection = new YMapCollection({});
        var citiesCollection = new YMapCollection({});

        var pathDealers = 'ajax/dealers.php';
        var pathDealerItem = 'ajax/dealers-item.php';
        var pathCities = 'ajax/cities.php';

        $.ajax({
            type: 'POST',
            url: pathDealers,
            dataType: 'json',
            cache: false
        }).fail(function(jqXHR, textStatus, errorThrown) {
            alert('Сервис временно недоступен, попробуйте позже.');
        }).done(function(data) {
            const markerElement = document.createElement('div');
            markerElement.className = 'new-map-marker-point';

            $(data).each(function(i, item){
                dealers.push([item.id, item.name, item.city]);

                var markerElement = document.createElement('div');
                markerElement.className = 'new-map-point';

                var markerElementIcon = document.createElement('div');
                markerElementIcon.className = 'new-map-point-icon';
				if (typeof(item.is_red) != 'undefined' && item.is_red == '1') {
                    markerElementIcon.className = 'new-map-point-icon red';
                }

                var markerElementPopup = document.createElement('div');
                markerElementPopup.className = 'new-map-point-popup';

                var popupElementTitle = document.createElement('div');
                popupElementTitle.classList.add('new-map-point-popup-title');
                popupElementTitle.innerHTML = '<span data-id="' + item.id + '">' + item.name + '</span>';

                var popupElementContent = document.createElement('div');
                popupElementContent.classList.add('new-map-point-popup-content');

                var closeIconElement = document.createElement('div');
                closeIconElement.classList.add('new-map-city-popup-close');
                closeIconElement.innerHTML = '<svg viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.76683 12.6666L3.8335 11.7333L7.56683 7.99998L3.8335 4.26665L4.76683 3.33331L8.50016 7.06665L12.2335 3.33331L13.1668 4.26665L9.4335 7.99998L13.1668 11.7333L12.2335 12.6666L8.50016 8.93331L4.76683 12.6666Z" /></svg>';
                closeIconElement.onclick = () => {
                    markerElement.classList.remove('open');
                };

                markerElementPopup.appendChild(popupElementTitle);
                markerElementPopup.appendChild(popupElementContent);
                markerElementPopup.appendChild(closeIconElement);

                markerElement.appendChild(markerElementIcon);
                markerElement.appendChild(markerElementPopup);

                var geopoint = item.geopoint.split(',');
                let newMarker = new YMapMarker(
                    {
                        coordinates: [parseFloat(geopoint[0]), parseFloat(geopoint[1])],
                        onClick() {
                            for (var j = 0; j < dealerCollection.children.length; j++) {
                                dealerCollection.children[j].element.classList.remove('open');
                            }
                            this.style.element.classList.add('open');
                            var curElement = $(this.style.element);
                            curElement.find('.new-map-point-popup-content').html('Данные загружаются...');
                            $.ajax({
                                url         : pathDealerItem,
                                type        : 'GET',
                                dataType    : 'json',
                                data        : {
                                    'nc_ctpl'   : '118',
                                    'template'  : '28',
                                    'dealer_id' : curElement.find('.new-map-point-popup-title span').attr('data-id')
                                },
                            }).fail(function(jqXHR, textStatus, errorThrown) {
                                curElement.find('.new-map-point-popup-content').html('Сервис временно недоступен, попробуйте позже');
                            }).done(function(data) {
                                if (data.status){
                                    curElement.find('.new-map-point-popup-content').html(data.text);
                                } else {
                                    curElement.find('.new-map-point-popup-content').html('Произошла ошибка');
                                }
                                let latY = map.bounds[0][1] - map.bounds[1][1];
                                let latYPerPixel = latY / map.size.y;
                                let popupHalfHeightLat = (curElement.find('.new-map-point-popup').outerHeight() / 2) * latYPerPixel;
                                console.log(popupHalfHeightLat);
                                map.setLocation({
                                    center: [parseFloat(geopoint[0]), parseFloat(geopoint[1]) + popupHalfHeightLat],
                                    duration: 500,
                                })
                            });
                        }
                    },
                    markerElement
                );
                dealerCollection.addChild(newMarker);
            });

            $.ajax({
                type: 'POST',
                url: pathCities,
                dataType: 'json',
                cache: false
            }).fail(function(jqXHR, textStatus, errorThrown) {
                alert('Сервис временно недоступен, попробуйте позже.');
            }).done(function(data) {
                var cityList = '';
                $(data).each(function(i, item) {
                    var markerElement = document.createElement('div');
                    markerElement.className = 'new-map-city';

                    var markerElementIcon = document.createElement('div');
                    markerElementIcon.className = 'new-map-city-icon';

                    var markerElementPopup = document.createElement('div');
                    markerElementPopup.className = 'new-map-city-popup';

                    var popupElementTitle = document.createElement('div');
                    popupElementTitle.classList.add('new-map-city-popup-title');
                    popupElementTitle.textContent = item.name;

                    var curCount = 0;
                    for (var d = 0; d < dealers.length; d++) {
                        if (dealers[d][2] == item.name) {
                            curCount++;
                        }
                    }
                    var popupElementLink = document.createElement('div');
                    popupElementLink.classList.add('new-map-city-popup-link');
                    popupElementLink.innerHTML = '<span data-coords="' + item.geopoint + '">Дилеров в городе: ' + curCount + '<svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.19451 3.70205L11.4927 7.00007L8.19451 10.2981L7.57982 9.66547L9.80772 7.43757L2.50701 7.43757L2.50701 6.56257L9.80772 6.56257L7.57982 4.33468L8.19451 3.70205Z" /></svg></span>';

                    var closeIconElement = document.createElement('div');
                    closeIconElement.classList.add('new-map-city-popup-close');
                    closeIconElement.innerHTML = '<svg viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.76683 12.6666L3.8335 11.7333L7.56683 7.99998L3.8335 4.26665L4.76683 3.33331L8.50016 7.06665L12.2335 3.33331L13.1668 4.26665L9.4335 7.99998L13.1668 11.7333L12.2335 12.6666L8.50016 8.93331L4.76683 12.6666Z" /></svg>';
                    closeIconElement.onclick = () => {
                        markerElement.classList.remove('open');
                    };

                    markerElementPopup.appendChild(popupElementTitle);
                    markerElementPopup.appendChild(popupElementLink);
                    markerElementPopup.appendChild(closeIconElement);

                    markerElement.appendChild(markerElementIcon);
                    markerElement.appendChild(markerElementPopup);

                    var geopoint = item.geopoint.split(',');
                    let newMarker = new YMapMarker(
                        {
                            coordinates: [parseFloat(geopoint[0]), parseFloat(geopoint[1])],
                            onClick() {
                                for (var j = 0; j < citiesCollection.children.length; j++) {
                                    citiesCollection.children[j].element.classList.remove('open');
                                }
                                this.style.element.classList.add('open');
                                map.setLocation({
                                    center: [parseFloat(geopoint[0]), parseFloat(geopoint[1])],
                                    duration: 500,
                                })
                            }
                        },
                        markerElement
                    );
                    citiesCollection.addChild(newMarker);

                    cityList += '<div class="map-city-search-select-popup-list-item" data-coords="' + item.geopoint + '">' + item.name + '</div>';
                });
                map.addChild(citiesCollection);
                $('.map-city-search-select-popup-list-inner').html(cityList);
                $('.overlay').hide();
            });
        });

        map.addChild(
            new YMapListener({
                onUpdate: function(e) {
                    let curZoom = Math.round(e.location.zoom);
                    if(curZoom > 8) {
                        map.addChild(dealerCollection);
                        map.removeChild(citiesCollection);
                    } else {
                        map.removeChild(dealerCollection);
                        map.addChild(citiesCollection);
                    }
                }
            })
        );

        $('body').on('click', '.new-map-city-popup-link span', function(e) {
            var coords = $(this).attr('data-coords').split(',');
            for (var j = 0; j < citiesCollection.children.length; j++) {
                citiesCollection.children[j].element.classList.remove('open');
            }
            map.update({location: {center: [coords[0], coords[1]], zoom: 10, duration: 1000, easing: 'ease-in-out'}});
        });

        $('body').on('click', '.map-city-search-select-popup-list-item', function(e) {
            var curItem = $(this);
            $('.map-city-search-select-current span').html(curItem.html());
            $('.map-city-search-select').removeClass('open');
            var coords = curItem.attr('data-coords').split(',');
            for (var j = 0; j < citiesCollection.children.length; j++) {
                citiesCollection.children[j].element.classList.remove('open');
            }
            map.update({location: {center: [coords[0], coords[1]], zoom: 10, duration: 1000, easing: 'ease-in-out'}});
        });
        
        $('.map-city-search-select-popup-search input').on('keyup blur change', function() {
            var curValue = $(this).val().toLowerCase();
            $('.map-city-search-select-popup-list-item').each(function() {
                var curItem = $(this);

                var curIndex = curItem.text().toLowerCase().indexOf(curValue);
                if (curIndex == -1) {
                    curItem.addClass('hidden');
                } else {
                    curItem.removeClass('hidden');
                }
            });
        });

    }

    $('.map-city-search-select-current').click(function() {
        $('.map-city-search-select').toggleClass('open');
        if ($('.map-city-search-select').hasClass('open')) {
            $('.map-city-search-select-popup-search input').trigger('focus');
        }
    });

    $(document).click(function(e) {
        if ($(e.target).parents().filter('.map-city-search-select').length == 0) {
            $('.map-city-search-select').removeClass('open');
        }
    });

});