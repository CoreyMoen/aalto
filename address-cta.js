//Add tracking attributes to each cta tab on load
$(document).ready(function () {
    $('#cta-find-home').attr('onclick', 'analytics && analytics.track(\'Pubsite - Toggle Find my home\')');
    $('#cta-sell-home').attr('onclick', 'analytics && analytics.track(\'Pubsite - Toggle Sell my home\')');
});

//Force hide of autocomplete menu on load
$(".us-autocomplete-pro-menu").css("display", "none");

//SmartyStreets autocomplete
$(function () {
    const inputs = $(".hero-cta_input");

    for (let inputIdx = 0; inputIdx < inputs.length; inputIdx++) {
        const input = $(inputs[inputIdx]);
        const menu = input.next(".us-autocomplete-pro-menu");

        function getSuggestions(search, selected) {
            console.log({
                search,
                selected
            });
            // const wordCount = (address || "").split(" ").length;
            // if (!address || wordCount < 2) {
            //   setSubmissionError("Please enter an address");
            //   return;
            // }
            $.ajax({
                url: "https://us-autocomplete-pro.api.smartystreets.com/lookup?",
                data: {
                    // Don't forget to replace the auth-id value with your own Website Key
                    "auth-id": "17374537058436311",
                    search: search,
                    selected: selected ? selected : "",
                },
                dataType: "jsonp",
                success: function (data) {
                    if (data.suggestions) {
                        buildMenu(data.suggestions);
                    } else {
                        noSuggestions();
                    }
                },
                error: function (error) {
                    return error;
                },
            });
        }

        function noSuggestions() {
            menu.empty();
            menu.append(
                "<li class='ui-state-disabled'><div>No Suggestions Found</div></li>"
            );
            menu.menu("refresh");
        }

        function buildAddress(suggestion) {
            let whiteSpace = "";
            if (suggestion.secondary || suggestion.entries > 1) {
                if (suggestion.entries > 1) {
                    suggestion.secondary +=
                        " (" + suggestion.entries + " more entries)";
                }
                whiteSpace = " ";
            }
            let address =
                suggestion.street_line +
                whiteSpace +
                suggestion.secondary +
                ", " +
                suggestion.city +
                ", " +
                suggestion.state +
                " " +
                suggestion.zipcode;
            let inputAddress = input.val();
            for (let i = 0; i < address.length; i++) {
                let theLettersMatch =
                    typeof inputAddress[i] == "undefined" ||
                    address[i].toLowerCase() !== inputAddress[i].toLowerCase();
                if (theLettersMatch) {
                    address = [address.slice(0, i), address.slice(i)].join("");
                    break;
                }
            }
            return address;
        }

        function buildMenu(suggestions) {
            menu.empty();
            suggestions.map(function (suggestion) {
                const caret =
                    suggestion.entries > 1 ?
                    '<span class="address-cta_caret"></span>' :
                    "";
                menu.append(
                    "<li><div data-address='" +
                    suggestion.street_line +
                    (suggestion.secondary ? " " + suggestion.secondary : "") +
                    ";" +
                    " " +
                    suggestion.city +
                    ";" +
                    " " +
                    suggestion.state +
                    "'>" +
                    caret +
                    buildAddress(suggestion) +
                    "</b></div></li>"
                );
            });
            menu.menu("refresh");
        }

        menu.menu({
            select: function (event, ui) {
                const text = ui.item[0].innerText;
                const address = ui.item[0].childNodes[0].dataset.address.split(";");
                const searchForMoreEntriesText = new RegExp(/(?:\ more\ entries\))/);
                input.val(address);

                if (text.search(searchForMoreEntriesText) == "-1") {
                    menu.hide();
                    input.attr("aria-expanded", "false");
                    input.attr('name', 'address');
                    $(".hero-cta_form")[0].submit();
                } else {
                    input.val(address[0] + " ");
                    var selected = text.replace(" more entries", "");
                    selected = selected.replace(",", "");
                    getSuggestions(address[0], selected);
                }
            },
        });

        input.keyup(function (event) {
            if (event.key === "ArrowDown") {
                menu.focus();
                menu.menu("focus", null, menu.menu().find(".ui-menu-item"));
            } else {
                const textInput = input.val();
                if (textInput) {
                    menu.show();
                    getSuggestions(textInput);
                    input.attr("aria-expanded", "true");
                } else {
                    menu.hide();
                    input.attr("aria-expanded", "false");
                }
            }
        });
    }
});

//Change address input name on form submit
$(".hero-cta_form").submit(function () {
    $(this).find("input[name=addressSearch]").attr("name", "address");
});
