/*!
 * @overview @croc/webclient v1.39.5 - 2020-04-30 19:40 
 * @author CROC Inc. <dev_rnd@croc.ru> 
 * @version 1.39.5 
 * @copyright 2011-2020 CROC Inc. <http://www.croc.ru> 
 * @license Private: software can be used only with written authorization from CROC Inc. 
 */

define({
	"languageName": "русский",
	"interop.server_version_changed": "Приложение было обновлено. Пожалуйста, перегрузите страницу.",
	"interop.server_version_changed.html": "Приложение было обновлено. Пожалуйста, <a href='#' class='x-cmd-link' data-cmd-name='Reload'>перегрузите</a> страницу.",
    "interop.offline": "Потеряна связь с сервером",
    "interop.online": "Восстановлена связь с сервером",
	"interop.server_offline": "Сервер недоступен",
	"interop.server_online": "Сервер доступен",
	"interop.appcache_obsolete_warning": "Сервер недоступен, либо проблемы в сети. Не закрывайте браузер для продолжения работы",
    "interop.save.success.local": "Изменения сохранены локально",
    "interop.save.success": "Изменения сохранены",
	"interop.save.success_with_warning": "Изменения сохранены с предупреждением",
	"interop.save.failed": "Ошибка при сохранении",
	"interop.error.default": "Ошибка при взаимодействии с сервером",
	"interop.error.OptimisticConcurrency": "Объект был изменён или удалён другим пользователем",
	"interop.error.OptimisticConcurrency.changed": "Объект был изменён другим пользователем",
	"interop.error.OptimisticConcurrency.deleted": "Объект был удалён другим пользователем",
	"interop.error.save_conflict_critical": "Сохранение и дальнейшая работа с данными невозможна.",
	"interop.error.save_conflict_partial": "Некоторые измененные объекты не могут быть сохранены, т.к. уже удалены на сервере. Вы можете повторить сохранение, если делали другие изменения.",
    "interop.sync.error": "Ошибка при синхронизации оффлайн-изменений",
    "interop.sync.error.many": "При синхронизации возникло несколько ошибок. Первая: ",
    "interop.sync.retry": "Повторить",
    "interop.sync.cancel": "Отказаться от изменений",
    "interop.sync.resolve": "Подробней",
	"interop.sync.changes_synced": "Изменения синхронизированы",
	"interop.saveLocally": "Сохранить локально",
	"interop.resource_or_page_not_found": "Ресурс или страница не найдены",
	"interop.server_unavailable": "Невозможно соединиться с сервером",
	"interop.server_critical_error": "На сервере возникла критическая ошибка при обработке запроса",
	"interop.server_interaction_timeout": "Превышено время ожидания ответа сервера",
	"interop.server_interaction_error": "Ошибка при взаимодействии с сервером",
	"interop.downloading_file": "Получение файла",
	"interop.uploading_file": "Отправка файла",
	"interop.sending_data": "Отправка данных",
	"interop.retrieving_data": "Получение данных",
	"interop.download_error": "При получении файла сервер вернул ошибку",
	"interop.download_error_offline": "Файл не может быть получен, т.к. потеряна связь с сервером",
	"interop.upload_error": "При отправке файла на сервер возникла ошибка",
	"interop.upload_cancelled": "Отправка файла прервана пользователем",
	"interop.go_offline": "Перейти в оффлайн",
	"interop.go_offline_prompt": "Вы уверены, что хотите перейти в оффлайн?",
	"interop.go_offline_hint": "Работать автономно, загрузка и сохранение будут только локальные без синхронизации с сервером",
	"interop.go_online": "Перейти в онлайн",
	"interop.went_offline": "Теперь вы работаете в оффлайне, все изменения будут сохраняться локально без синхронизации",
	"interop.check_connection": "Проверить соединение",
	"interop.store.error.raw.html": "Попробуйте закрыть и снова открыть браузер. Если это не помогло, Вы можете <a href='#' class='x-cmd-link' data-cmd-name='Recreate'>пересоздать</a> локальное хранилище.",
	"interop.store.recreate.header": "Пересоздание локального хранилища",
	"interop.store.recreate.prompt": "В результате этой операции все несинхронизированные данные будут потеряны. Вы уверены, что хотите продолжить?",
	"interop.store.recreate.success": "Локальное хранилище успешно пересоздано",
	"interop.hint.returned_local_data_due_to_server_error": "Данные загружены из локального хранилища, т.к. при обращении на сервер возникла ошибка",
	"interop.hint.returned_local_data_due_to_server_offline": "Данные загружены из локального хранилища, т.к. сервер недоступен",

	// data store
	"datastore.error.raw": "Ошибка при обращении к локальному хранилищу данных",
	"datastore.error.QuotaExceededError": "Недостаточно места на диске",

	// components
	"objectEditor.name": "Редактор",
	"objectEditor.return_to_edit": "Вернуться к редактированию",
	"objectEditor.query_unload_prompt": "В редакторе есть несохраненные изменения. Вы уверены, что хотите покинуть редактор и потерять изменения?",
	"objectEditor.nested_query_unload_prompt": "В редакторе есть несохраненные изменения. Сохранить их (Да/Нет) и уйти или продолжить редактирование (Отмена)?",
	"objectEditor.command_hint.saveAndClone": "Сохранить изменения и закрыть редактор",
	"objectEditor.command_hint.apply": "Сохранить текущие изменения и продолжить редактирование",
	"objectEditor.command_hint.cancelAndClose": "Закрыть редактор без сохранения (все изменения будут утеряны)",

	"objectWizard.pageSummary.noData": "Нет данных",

	"expandablePanel.expand": "Развернуть",
	"expandablePanel.collapse": "Свернуть",

	"objectFilter.clear": "Очистить фильтр",
	"objectFilter.show": "Показать фильтр",
	"objectFilter.hide": "Свернуть фильтр",
	"objectFilter.filters": "Фильтры",
	"objectFilter.saveFilter": "Сохранить фильтр",
	"objectFilter.mergeSavedFilter": "Добавить к текущим ограничениям фильтра",
	"objectFilter.deleteSavedFilter": "Удалить фильтр",
	"objectFilter.noSavedFilters": "Нет сохраненных фильтров",
	"objectFilter.delete_all_filters_prompt": "Удалить все сохраненные фильтры?",
	"objectFilter.saveFilter.saveAsNew": "Сохранить как новый",
	"objectFilter.saveFilter.saveAsExisting": "Перезаписать существующий",
	"objectFilter.saveFilter.currentRestrictions": "Текущие условия",
	"objectFilter.saveFilter.existingFilter": "Существующий фильтр",
	"objectFilter.saveFilter.chooseFilter": "Выберите фильтр",
	"objectFilter.saveFilter.chosenFilterRestrictions": "Условия выбранного фильтра",
	"objectFilter.saveFilter.copyCurrentRestrictions": "Скопировать текущие условия",
	"objectFilter.saveFilter.empty_name_error":"Наименование должно быть задано",
	"objectFilter.saveFilter.non_unique_error": "Фильтр с таким наименование уже существует",
	"objectFilter.saveFilter.empty_existingFilter_error": "Выберите существующий фильтр для перезаписи",
	"objectFilter.error_get_restrictions": "Возникла ошибка(и) во время получения ограничений фильтра",
	"objectList.name": "Список",
	"objectList_editable.delete.one.prompt": "Вы уверены, что хотите удалить текущий объект?",
	"objectList_editable.delete.many.prompt_format": "Вы уверены, что хотите удалить {0}?",
	"objectList.delete.one.prompt": "Объект будет удален без возможности восстановления. Вы уверены, что хотите продолжить?",
	"objectList.delete.many.prompt_format": "{0} будут удалены без возможности восстановления. Вы уверены, что хотите продолжить?",
	"objectList.delete.selected_or_active_one.prompt": "Вы хотите удалить отмеченный объект или удалить текущий активный объект?",
	"objectList.delete.selected_or_active_many.prompt_format": "Вы хотите удалить отмеченные объекты ({0}) или удалить только текущий активный объект?",
	"objectList.delete.selected_or_active_one.confirm_selected_one": "Удалить отмеченный",
	"objectList.delete.selected_or_active_one.confirm_selected_many": "Удалить отмеченные",
	"objectList.delete.selected_or_active_one.confirm_active": "Удалить активный",
	"objectList.reloadCaption": "Список",
	"objectList.reloadWarning": "В списке содержатся несохраненные данные. Вы хотите отказаться от модификаций и перегрузить список?",
	"objectList.exportDownloaded": "Файл экспорта получен с сервера",
	"objectList.exportError": "Ошибка при экспорте данных",
	"objectList.exportTo": "Экспортировать в",
	"objectList.state.load_failed": "Возникла ошибка при загрузке данных",
	"objectList.state.not_loaded": "Нажмите <a href='#' class='x-cmd-link' data-cmd-name='Reload'><strong>Обновить</strong></a> для загрузки данных",
	"objectList.state.no_data": "Данных не найдено",
	"objectList.state.no_local_data": "Локальных данных не найдено",
	"objectList.hint.no_data_except_unsaved": "Данных не найдено, в списке отображаются только объекты с несохраненными изменениями",
	"objectList.getRestrictionsError": "Данные не были обновлены, так как при получении ограничений возникла ошибка: ",
	"objectList.columnsSettings.header": "Настройки колонок",
	"objectList.columnsSettings.columnTitle": "Колонка",
	"objectList.columnsSettings.reset": "Сброс",
	"objectList.columnsSettings.reset.hint": "Сброс настроек колонок в исходное состояние",
	"objectList.columnsSettings.removeSorting": "Удалить сортировку",
	"objectList.columns.number": "№",
	"objectList.columns.icon": "Иконка",
	"objectList.columns.check": "Выбрать/снять всё",
	"objectList.dataError": "Ошибка при получении данных",
	"objectList.maxRowsExceeded": "Найдено слишком много подходящих элементов. Загружены первые {0} из них.",
	"objectList.pager.stat": "Показано {0} - {1} из {2}",
	"objectList.pager.pageSize": "Записей на странице:",
	"objectList.tooManyFilters": "Превышено максимально допустимое количество колоночных фильтров. Это может привести к замедлению работы. Продолжить выполнение запроса данных?",

	"objectTree.name": "Иерархия",
	"objectTree.editableDelete": "Вы уверены, что хотите удалить объект(ы)?",
	"objectTree.editableDelete.one": "Вы уверены, что хотите удалить объект?",
	"objectTree.editableDelete.many": "Вы уверены, что хотите удалить объекты?",
	"objectTree.delete": "Объект(ы) будут удалены без возможности восстановления. Вы уверены, что хотите продолжить?",
	"objectTree.delete.one": "Объект будет удален без возможности восстановления. Вы уверены, что хотите продолжить?",
	"objectTree.delete.many": "Объекты будут удалены без возможности восстановления. Вы уверены, что хотите продолжить?",
	"objectTree.selectChildren": "Выбрать дочерние узлы",
	"objectTree.selectSiblings": "Выбрать соседние узлы",
	"objectTree.state.load_failed": "Возникла ошибка при загрузке данных",
	"objectTree.state.not_loaded": "Нажмите <a href='#' class='x-cmd-link'><strong>Обновить</strong></a> для загрузки данных",
	"objectTree.state.no_data": "Данных не найдено",
	"objectTree.error.node_load": "Ошибка при загрузке",
	"objectTree.getRestrictionsError": "При получении ограничений возникла ошибка: ",
	"objectTree.search": "Поиск...",
	"objectTree.searchStat": "Найдено элементов: {0} из {1}",

	"editorPresenter.errorsFound": "Обнаружены ошибки:",

	// ObjectResolutionPart
	"objectResolution.info": "Отметьте свойства, которые будут перезаписаны локальными значениями. Для неотмеченных свойств локальные значения будут заменены серверными.",
	"objectResolution.info.removed": "Локальный объект был удален. Подтвердите, что Вы хотите удалить объект на сервере.",
	"objectResolution.column.property": "Свойство",
	"objectResolution.column.server_value": "Серверное значение",
	"objectResolution.column.local_value": "Локальное значение",
	"objectResolution.column.overwrite": "Перезаписать",
	"objectResolution.column.checked.hint": "Если отмечено, то будет сохранено локальное значение; иначе - серверное.",
	"objectResolution.removed_object": "Объект удален",
	"objectResolution.menu.save": "ОК",
	"objectResolution.menu.confirmDeletion": "Подтвердить удаление",
	"objectResolution.menu.cancel": "Отмена",

	// ConcurrencyErrorPart
	"concurrencyErrorPart.prompt": "Во время вашего редактирования объект был изменен или удален другим пользователем. Вы можете:",
	"concurrencyErrorPart.keepServer": "Перегрузить",
	"concurrencyErrorPart.keepLocal": "Перезаписать",
	"concurrencyErrorPart.resolve": "Разрешить",
	"concurrencyErrorPart.keepServer.hint": "Оставить серверную версию, ваши данные не сохранятся",
	"concurrencyErrorPart.keepLocal.hint": "Сохранить свою версию, серверная версия будет полностью заменена вашей",
	"concurrencyErrorPart.resolve.hint": "Сравнить обе версии и выбрать какие изменения принять",

	"wizard.Backward": "Назад",
	"wizard.Forward": "Далее",

//	"navigationPE.unlinkHeader": "Разрыв связи",
//	"navigationPE.unlinkPrompt": "Вы уверены, что хотите разорвать связь с объектом(ами)?",
//	"navigationPE.unlinkPrompt.one": "Вы уверены, что хотите разорвать связь с объектом?",
//	"navigationPE.unlinkPrompt.many": "Вы уверены, что хотите разорвать связь с объектами?",
	"navigationPE.deleteHeader": "Удаление",
	"navigationPE.deletePrompt": "Вы уверены, что хотите удалить объект(ы)?",
	"navigationPE.deletePrompt.one": "Вы уверены, что хотите удалить объект?",
	"navigationPE.deletePrompt.many": "Вы уверены, что хотите удалить объекты?",
	"navigationPE.unlink.scalar": "Очистить",
	"navigationPE.unlink.many": "Исключить",

	"objectSelector.title": "{0}: выбор",

	"peBinary.previewLoadingError": "Ошибка загрузки изображения",
	"peBinary.clear": "Очистить",
	"peBinary.save": "Сохранить...",
	"peBinary.open": "Открыть",
	"peBinary.selectFile": "Выбрать файл...",
	"peBinary.cancelUpload": "Отменить загрузку",
	"peBinary.uploading": "Загрузка",
	"peBinary.processing": "Обработка",
	"peBinary.alertOnUploading": "Не закрывайте редактор и не уходите со страницы. Пожалуйста, дождитесь окончания загрузки.",
	"peBinary.placeholder": "Выберите файл для загрузки. Можно также перетащить файл сюда.",
	"peBinary.previewNotAvailable": "Предпросмотр недоступен",
	"peBinary.multiple_files_not_supported": "Множество файлов не поддерживается",
	"peBinary.filetype_not_supported": "Тип файла не поддерживается",

	"peString.copy": "Скопировать",
	"peString.letterCounter.tip": "Отношение количества набранных символов к их максимальному количеству",

	"peBooleanSwitch.null": "?",
	"peEnumSwitch.null": "?",

	"peObjectDropDownLookup.loadingError": "Ошибка при загрузке значения: ",

	"peObjectList.orphan.unlink.one": "Исключаемый объект содержит изменения, которые будут утеряны. Продолжить?",
	"peObjectList.orphan.unlink.many_all": "Исключаемые объекты содержат изменения, которые будут утеряны. Продолжить?",
	"peObjectList.orphan.unlink.many_some": "Некоторые из исключаемых объектов содержат изменения, которые будут утеряны. Продолжить?",
	"peObjectList.unlink.one.prompt": "Вы уверены, что хотите исключить текущий объект?",
	"peObjectList.unlink.many.prompt_format": "Вы уверены, что хотите исключить {0}?",
	"peObjectList.unlink.selected_or_active_one.prompt": "Вы хотите исключить отмеченный объект или исключить текущий активный объект?",
	"peObjectList.unlink.selected_or_active_many.prompt_format": "Вы хотите исключить отмеченные объекты ({0}) или исключить только текущий активный объект?",
	"peObjectList.unlink.selected_or_active_one.confirm_selected_one": "Исключить отмеченный",
	"peObjectList.unlink.selected_or_active_one.confirm_selected_many": "Исключить отмеченные",
	"peObjectList.unlink.selected_or_active_one.confirm_active": "Исключить активный",
	"peObject.orphan": "Текущее значение свойства содержит изменения, которые будут утеряны. Продолжить?",
	"peObjectList.validation.itemsViolations": "Возникли ошибки при проверке связанных объектов.",

	"peObjectMultiSelect.inputTooShort": "Пожалуйста, введите {0} или более символов",

	// modules
	"app-navigation": "Навигация",

	// Common commands
	"cancel": "Отмена",
	"close": "Закрыть",
	"reload": "Обновить",
	"loadMore": "Ещё",
	"loadNMore": "Ещё {0}",
	"loadPrev": "Предыдущие",
	"loadNext": "Следующие",
	"loadAll": "Загрузить все",
	"cancel_reload": "Прервать",
	"edit": "Редактировать",
	"view": "Просмотр",
	"delete": "Удалить",
	"delete_all": "Удалить все",
	"create": "Создать",
	"add": "Добавить",
	"unlink": "Разорвать связь",
	"select": "Выбрать",
	"selectAll": "Выбрать все",
	"selectNone": "Сбросить выделение",
	"selection": "Выделение",
	"selected": "Выделено",
	"save": "Сохранить",
	"apply": "Применить",
	"save_close": "Сохранить",
	"retry": "Повторить",
	"expand": "Развернуть",
	"collapse": "Свернуть",
	"print": "Печать",
	"clear": "Очистить",
	"customize": "Настройки",
	"archive": "Архивировать",
	"archive_all": "Архивировать все",
	"back": "Назад",
	"overwrite": "Перезаписать",
	"increase_row_height": "Увеличить высоту строк",
	"decrease_row_height": "Уменьшить высоту строк",
	"total": "Всего",

	// Common labels
	"yes": "Да",
	"no": "Нет",
	"ok": "OK",
	"value_not_specified": "Значение не задано",
	"value_not_set": "Значение не установлено",
	"value_not_loaded": "Значение не загружено",
	"select_value_prompt": "Выберите значение",
	"select_values_prompt": "Выберите значения",
	"not_loaded": "Не загружено",
	"not_found": "Не найдено",
	"not_specified": "Не задано",
	"editor": "Редактор",
	"list": "Список",
	"name": "Наименование",

	// Errors:
	"error": "Ошибка",
	"data_load_error": "Ошибка при загрузке данных",
	"not_authorized": "Нет доступа",
	"operation_was_canceled": "Операция была отменена",
	"object_not_found": "Объект не найден",
	"application_init_failed": "Что-то пошло не так",

	// Messages:
	"wait": "Пожалуйста, подождите...",
	"loading": "Загрузка...",
	"searching": "Поиск...",
	"no_matches": "Совпадений не найдено",
	"saving": "Сохранение изменений...",
	"closing_canceled": "Закрытие отменено",
	"dayForms": ["день", "дня", "дней"],
	"yesterday": "вчера",
	"today": "сегодня",
	"tomorrow": "завтра",
	"ago": "назад",
	"time.at": "в",
	"time.in": "через",
	"bytesForms": ["байт", "байта", "байт"],
	"kbytesForms": ["Кбайт", "Кбайта", "Кбайт"],
	"mbytesForms": ["Мбайт", "Мбайта", "Мбайт"],
	"gbytesForms": ["Гбайт", "Гбайта", "Гбайт"],
	"tbytesForms": ["Тбайт", "Тбайта", "Тбайт"],

	"timeSpan.y": "г",
	"timeSpan.M": "м",
	"timeSpan.d": "д",
	"timeSpan.h": "ч",
	"timeSpan.m": "мин",
	"timeSpan.s": "сек",

	// validation
	"validation.integer": "Значение должно быть целым числом",
	"validation.number": "Значение должно быть числом",
	"validation.dateTime": "Значение должно быть датой, числом или строкой",
	"validation.dateTimeFormat": "Значение должно быть в формате 2012-03-04T00:00:00.000",
	"validation.boolean": "Значение должно быть одним из: true, false, 1 или 0",
	"validation.maxLen": "Максимальное количество символов: ",
	"validation.minLen": "Минимальное количество символов: ",
	"validation.minValue": "Значение должно быть больше или равно ",
	"validation.maxValue": "Значение должно быть меньше или равно ",
	"validation.range": "Значение должно быть в диапазоне ",
	"validation.inclusive": "включительно",
	"validation.pattern": "Значение не соответствует шаблону: ",
	"validation.minInclusive": "Значение должно быть не ранее ",
	"validation.maxInclusive": "Значение должно быть не позднее ",
	"validation.minExclusive": "Значение должно быть не ранее ",
	"validation.maxExclusive": "Значение должно быть не позднее ",
	"validation.totalDigits": "Максимальное количество знаков: ",
	"validation.fractionDigits": "Максимальное количество знаков дробной части: ",
	"validation.nullable": "Свойство должно иметь значение",
	"validation.enum": "Значение должно соответствовать перечислению: ",
	"validation.timeSpan": "Значение должно быть числом или строкой в формате ISO6801 (P1Y2M3DT4H5M6S) или .NET (7.23:59:59.999)",

	"validation.ui.ignore_warnings_prompt": "В процессе проверки возникли предупреждения. Вы уверены, что хотите проигнорировать их и продолжить?",

	// query condition
	"condition.title": "Условие",
	"condition.eq": "Равно",
	"condition.ne": "Не равно",
	"condition.contains": "Содержит",
	"condition.starts": "Начинается с",
	"condition.ends": "Оканчивается на",
	"condition.not-contains": "Не содержит",
	"condition.not-starts": "Не начинается с",
	"condition.not-ends": "Не оканчивается на",
	"condition.null": "Пустое значение",
	"condition.not-null": "Не пустое значение",
	// query condition for flag enum
	"condition.all": "Содержит",
	"condition.not-all": "Не содержит",

	words_forms: {
		objects: ["объект", "объекта", "объектов"]
	}
});
