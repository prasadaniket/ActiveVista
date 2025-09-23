import * as React from "react"
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarDays,
} from "lucide-react"
import { DayPicker, getDefaultClassNames } from "react-day-picker";

import { cn } from "@/lib/utils"
import { Button, buttonVariants } from "@/components/ui/button"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = "label",
  buttonVariant = "ghost",
  formatters,
  components,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <div className="bg-white rounded-2xl shadow-modern border-0 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4">
        <div className="flex items-center gap-3 text-white">
          <CalendarDays className="h-6 w-6" />
          <h3 className="text-lg font-semibold">Workout Calendar</h3>
        </div>
      </div>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn(
          "bg-white group/calendar p-4 [--cell-size:--spacing(8)]",
          String.raw`rtl:**:[.rdp-button\_next>svg]:rotate-180`,
          String.raw`rtl:**:[.rdp-button\_previous>svg]:rotate-180`,
          className
        )}
        captionLayout={captionLayout}
        formatters={{
          formatMonthDropdown: (date) =>
            date.toLocaleString("default", { month: "short" }),
          ...formatters,
        }}
        classNames={{
          root: cn("w-fit", defaultClassNames.root),
          months: cn("flex gap-4 flex-col md:flex-row relative", defaultClassNames.months),
          month: cn("flex flex-col w-full gap-4", defaultClassNames.month),
          nav: cn(
            "flex items-center gap-1 w-full absolute top-0 inset-x-0 justify-between",
            defaultClassNames.nav
          ),
          button_previous: cn(
            buttonVariants({ variant: "ghost" }),
            "size-8 aria-disabled:opacity-50 p-0 select-none hover:bg-indigo-50 rounded-lg",
            defaultClassNames.button_previous
          ),
          button_next: cn(
            buttonVariants({ variant: "ghost" }),
            "size-8 aria-disabled:opacity-50 p-0 select-none hover:bg-indigo-50 rounded-lg",
            defaultClassNames.button_next
          ),
          month_caption: cn(
            "flex items-center justify-center h-8 w-full px-8",
            defaultClassNames.month_caption
          ),
          dropdowns: cn(
            "w-full flex items-center text-sm font-medium justify-center h-8 gap-1.5",
            defaultClassNames.dropdowns
          ),
          dropdown_root: cn(
            "relative has-focus:border-indigo-300 border border-gray-200 shadow-sm has-focus:ring-indigo-500/50 has-focus:ring-2 rounded-lg",
            defaultClassNames.dropdown_root
          ),
          dropdown: cn("absolute bg-white inset-0 opacity-0", defaultClassNames.dropdown),
          caption_label: cn("select-none font-semibold text-gray-900", captionLayout === "label"
            ? "text-base"
            : "rounded-lg pl-2 pr-1 flex items-center gap-1 text-sm h-8 [&>svg]:text-gray-500 [&>svg]:size-3.5", defaultClassNames.caption_label),
          table: "w-full border-collapse",
          weekdays: cn("flex", defaultClassNames.weekdays),
          weekday: cn(
            "text-gray-600 rounded-lg flex-1 font-medium text-sm select-none py-2",
            defaultClassNames.weekday
          ),
          week: cn("flex w-full mt-1", defaultClassNames.week),
          week_number_header: cn("select-none w-8", defaultClassNames.week_number_header),
          week_number: cn(
            "text-sm select-none text-gray-500",
            defaultClassNames.week_number
          ),
          day: cn(
            "relative w-full h-full p-0 text-center group/day aspect-square select-none",
            defaultClassNames.day
          ),
          range_start: cn("rounded-lg bg-indigo-100", defaultClassNames.range_start),
          range_middle: cn("rounded-none", defaultClassNames.range_middle),
          range_end: cn("rounded-lg bg-indigo-100", defaultClassNames.range_end),
          today: cn(
            "bg-indigo-50 text-indigo-700 rounded-lg font-semibold data-[selected=true]:rounded-lg",
            defaultClassNames.today
          ),
          outside: cn(
            "text-gray-400 aria-selected:text-gray-400",
            defaultClassNames.outside
          ),
          disabled: cn("text-gray-300 opacity-50", defaultClassNames.disabled),
          hidden: cn("invisible", defaultClassNames.hidden),
          ...classNames,
        }}
        components={{
          Root: ({ className, rootRef, ...props }) => {
            return (<div data-slot="calendar" ref={rootRef} className={cn(className)} {...props} />);
          },
          Chevron: ({ className, orientation, ...props }) => {
            if (orientation === "left") {
              return (<ChevronLeftIcon className={cn("size-4 text-gray-600", className)} {...props} />);
            }

            if (orientation === "right") {
              return (<ChevronRightIcon className={cn("size-4 text-gray-600", className)} {...props} />);
            }

            return (<ChevronDownIcon className={cn("size-4 text-gray-600", className)} {...props} />);
          },
          DayButton: CalendarDayButton,
          WeekNumber: ({ children, ...props }) => {
            return (
              <td {...props}>
                <div
                  className="flex size-8 items-center justify-center text-center">
                  {children}
                </div>
              </td>
            );
          },
          ...components,
        }}
        {...props} />
    </div>
  );
}

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}) {
  const defaultClassNames = getDefaultClassNames()

  const ref = React.useRef(null)
  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        "data-[selected-single=true]:bg-indigo-500 data-[selected-single=true]:text-white data-[selected-single=true]:shadow-lg data-[range-middle=true]:bg-indigo-100 data-[range-middle=true]:text-indigo-700 data-[range-start=true]:bg-indigo-500 data-[range-start=true]:text-white data-[range-end=true]:bg-indigo-500 data-[range-end=true]:text-white group-data-[focused=true]/day:border-indigo-300 group-data-[focused=true]/day:ring-indigo-500/50 hover:bg-indigo-50 hover:text-indigo-700 flex aspect-square size-auto w-full min-w-8 flex-col gap-1 leading-none font-medium group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-2 data-[range-end=true]:rounded-lg data-[range-end=true]:rounded-r-lg data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-lg data-[range-start=true]:rounded-l-lg transition-all duration-200 [&>span]:text-xs [&>span]:opacity-70",
        defaultClassNames.day,
        className
      )}
      {...props} />
  );
}

export { Calendar, CalendarDayButton }
